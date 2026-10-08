import { useEffect, useRef, useState } from 'react'
import { loadGoogleMaps } from './loadGoogleMaps.js'
import './Map.css'

// Used only until the browser gives us a real position.
const HKU_CAMPUS = { lat: 22.283, lng: 114.137 }

// Show this many turns. The rest stay hidden until the person reaches them.
const STEPS_ON_SCREEN = 2

// Close enough to a turn that we can show the next one.
const STEP_DONE_METERS = 30

const BUILDING_SUGGESTIONS = [
  'HKU Main Library',
  'HKU Main Building',
  'Chow Yei Ching Building',
  'K.K. Leung Building',
  'Rayson Huang Theatre',
  'Haking Wong Building',
  'Centennial Campus',
]

function destinationQuery(building) {
  // Most people will type a short building name. Pin it to HKU
  // so Google does not pick a same-named place somewhere else.
  if (/hong kong|hku|university of hong kong/i.test(building)) {
    return building
  }
  return `${building}, University of Hong Kong`
}

function plainText(html) {
  return html.replace(/<[^>]+>/g, '').replace(/\s*\n\s*/g, ' · ')
}

function walkSummary(distanceMeters, durationSeconds) {
  const distance = distanceMeters >= 1000
    ? `${(distanceMeters / 1000).toFixed(1)} km`
    : `${distanceMeters} m`
  const minutes = Math.max(1, Math.round(durationSeconds / 60))
  return `${distance}, about ${minutes} min walk`
}

function distanceMeters(a, b) {
  const earth = 6371000
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * earth * Math.asin(Math.sqrt(h))
}

// 0 is north, 90 is east. Same numbers Google uses for map heading.
function bearing(from, to) {
  const lat1 = (from.lat * Math.PI) / 180
  const lat2 = (to.lat * Math.PI) / 180
  const dLng = ((to.lng - from.lng) * Math.PI) / 180
  const y = Math.sin(dLng) * Math.cos(lat2)
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
}

function pointBetween(a, b, amount) {
  return {
    lat: a.lat + (b.lat - a.lat) * amount,
    lng: a.lng + (b.lng - a.lng) * amount,
  }
}

function MapPage() {
  const mapDiv = useRef(null)
  const mapRef = useRef(null)
  const mapsRef = useRef(null)
  const userMarker = useRef(null)
  const routeLine = useRef(null)
  const hasRoute = useRef(false)
  const locationRef = useRef(null)
  const stepsRef = useRef([])
  const stepIndexRef = useRef(0)
  const routeOrigin = useRef(null)
  const modeRef = useRef('2d')
  const lastCamera = useRef(null)

  const [location, setLocation] = useState(null)
  const [building, setBuilding] = useState('')
  const [status, setStatus] = useState('Finding your location...')
  const [steps, setSteps] = useState([])
  const [stepIndex, setStepIndex] = useState(0)
  const [mode, setMode] = useState('2d')

  function rememberSteps(nextSteps, index) {
    stepsRef.current = nextSteps
    stepIndexRef.current = index
    setSteps(nextSteps)
    setStepIndex(index)
  }

  // Move past any turn the person is already standing on.
  function advanceSteps(here) {
    // Don't tick the list forward until they actually leave the start.
    if (routeOrigin.current && distanceMeters(routeOrigin.current, here) < 12) return false

    const previous = stepIndexRef.current
    let index = previous
    const all = stepsRef.current
    while (index < all.length - 1 && distanceMeters(here, all[index]) < STEP_DONE_METERS) {
      index += 1
    }
    if (index !== previous) {
      stepIndexRef.current = index
      setStepIndex(index)
    }
    return index !== previous
  }

  // Tilt the map and look along the route, so the line sits in front of the user.
  function followIn3d(here, force) {
    const map = mapRef.current
    if (!map || modeRef.current !== '3d') return
    // Ignore tiny GPS wobble, unless the current turn just changed.
    if (!force && lastCamera.current && distanceMeters(lastCamera.current, here) < 8) return

    const target = stepsRef.current[stepIndexRef.current]
    // One camera update. Calling panTo on its own snaps the map back to flat.
    const camera = {
      center: here,
      zoom: 18,
      tilt: 45,
      heading: 0,
    }
    if (target) {
      camera.heading = bearing(here, target)
      camera.center = pointBetween(here, target, 0.35)
    }
    map.moveCamera(camera)
    lastCamera.current = here
  }

  function showFlatMap() {
    const map = mapRef.current
    const maps = mapsRef.current
    if (!map || !maps) return

    map.setMapTypeId('roadmap')
    lastCamera.current = null

    const flatten = () => {
      if (modeRef.current !== '2d') return
      map.setTilt(0)
      map.setHeading(0)
    }

    if (routeLine.current) {
      const bounds = new maps.LatLngBounds()
      routeLine.current.getPath().forEach((point) => bounds.extend(point))
      map.fitBounds(bounds)
      // fitBounds animates, then we flatten so it does not stay tilted.
      maps.event.addListenerOnce(map, 'idle', flatten)
    } else if (locationRef.current) {
      map.panTo(locationRef.current)
      map.setZoom(16)
      flatten()
    } else {
      flatten()
    }
  }

  function setView(next) {
    modeRef.current = next
    setMode(next)
    if (next === '3d' && locationRef.current) {
      lastCamera.current = null
      followIn3d(locationRef.current)
    } else {
      showFlatMap()
    }
  }

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      setStatus('Add VITE_GOOGLE_MAPS_API_KEY to frontend/.env and restart the app.')
      return
    }

    let watchId = null
    let cancelled = false

    loadGoogleMaps(apiKey)
      .then((maps) => {
        if (cancelled || !mapDiv.current) return

        // DEMO_MAP_ID is Google's test id. It is what allows the map to tilt.
        const map = new maps.Map(mapDiv.current, {
          center: HKU_CAMPUS,
          zoom: 16,
          // Tilt only works on a vector map. DEMO_MAP_ID is Google's test id for that.
          mapId: 'DEMO_MAP_ID',
          renderingType: 'VECTOR',
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        })

        mapRef.current = map
        mapsRef.current = maps

        if (!navigator.geolocation) {
          setStatus('This browser cannot share your location.')
          return
        }

        // watchPosition keeps the marker moving as you walk.
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const here = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }
            locationRef.current = here
            setLocation(here)

            if (!userMarker.current) {
              userMarker.current = new maps.Marker({
                map,
                position: here,
                title: 'You are here',
              })
              map.setCenter(here)
            } else {
              userMarker.current.setPosition(here)
            }

            if (hasRoute.current) {
              const turnChanged = advanceSteps(here)
              followIn3d(here, turnChanged)
            } else {
              setStatus('Location found. Type a building and press Walk there.')
              if (modeRef.current === '3d') followIn3d(here)
            }
          },
          () => {
            setStatus('Location was blocked. Allow it in the browser, then refresh.')
          },
          { enableHighAccuracy: true, maximumAge: 5000 },
        )
      })
      .catch(() => {
        if (!cancelled) setStatus('Google Maps did not load. Check the API key.')
      })

    return () => {
      cancelled = true
      if (watchId != null) navigator.geolocation.clearWatch(watchId)
    }
  }, [])

  function onSearch(event) {
    event.preventDefault()
    const query = building.trim()

    if (!query) return

    if (!location || !mapsRef.current) {
      setStatus('Still waiting for your location.')
      return
    }

    setStatus('Finding a walking route...')

    // Our server calls Google. The page key is only allowed to show the map.
    fetch('/api/directions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: location,
        destination: destinationQuery(query),
      }),
    })
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || 'No walking route found.')
        }
        return data
      })
      .then((data) => {
        const maps = mapsRef.current
        const path = maps.geometry.encoding.decodePath(data.polyline)

        if (routeLine.current) routeLine.current.setMap(null)
        routeLine.current = new maps.Polyline({
          path,
          map: mapRef.current,
          strokeColor: '#024638',
          strokeWeight: 6,
        })

        const nextSteps = data.steps.map((step) => ({
          text: plainText(step.text),
          lat: step.lat,
          lng: step.lng,
        }))
        routeOrigin.current = locationRef.current
        rememberSteps(nextSteps, 0)
        hasRoute.current = true
        setStatus(walkSummary(data.distanceMeters, data.durationSeconds))

        if (modeRef.current === '3d') {
          lastCamera.current = null
          followIn3d(locationRef.current)
        } else {
          const bounds = new maps.LatLngBounds()
          path.forEach((point) => bounds.extend(point))
          mapRef.current.fitBounds(bounds)
        }
      })
      .catch((error) => {
        hasRoute.current = false
        rememberSteps([], 0)
        setStatus(error.message || 'No walking route for that. Try a fuller name, like "HKU Main Library".')
      })
  }

  const upcoming = steps.slice(stepIndex, stepIndex + STEPS_ON_SCREEN)

  return (
    <section className="map-page" aria-labelledby="map-title">
      <h1 id="map-title">Campus map</h1>
      <form className="map-search" onSubmit={onSearch}>
        <label htmlFor="building">Building</label>
        <input
          id="building"
          name="building"
          list="hku-buildings"
          value={building}
          onChange={(event) => setBuilding(event.target.value)}
          placeholder="e.g. HKU Main Library"
          autoComplete="off"
        />
        <datalist id="hku-buildings">
          {BUILDING_SUGGESTIONS.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
        <button type="submit">Walk there</button>
      </form>
      <p className="map-status">{status}</p>
      <div className="map-frame">
        <div ref={mapDiv} className="map-canvas" />
        <div className="map-mode" role="group" aria-label="Map view">
          <button type="button" aria-pressed={mode === '2d'} onClick={() => setView('2d')}>
            2D
          </button>
          <button type="button" aria-pressed={mode === '3d'} onClick={() => setView('3d')}>
            3D
          </button>
        </div>
        {upcoming.length > 0 && (
          <ol className="map-steps">
            {upcoming.map((step, offset) => (
              <li key={stepIndex + offset}>{step.text}</li>
            ))}
          </ol>
        )}
      </div>
    </section>
  )
}

export default MapPage
