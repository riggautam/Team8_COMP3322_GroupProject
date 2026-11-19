import { useEffect, useRef, useState } from 'react'
import PageBanner from '../../components/layout/PageBanner.jsx'
import Icon from '../../components/ui/Icon.jsx'
import usePost from '../../hooks/usePost.js'
import { loadGoogleMaps } from './loadGoogleMaps.js'
import './Map.css'

// Used only until the browser gives us a real position.
const HKU_CAMPUS = { lat: 22.283, lng: 114.137 }

// When the walk starts from your location, show this many turns. The rest stay hidden until
// the person reaches them. A walk from a typed place shows every turn, for planning ahead.
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

// Shown under the form while "My location" is chosen and we don't have a position yet.
const LOCATION_HINTS = {
  finding: 'Finding your location…',
  blocked:
    'Location is blocked. Type where you are starting from, or allow location in the browser and press My location.',
  unavailable: 'Could not find your location right now. Type where you are starting from instead.',
  unsupported: 'This browser cannot share your location. Type where you are starting from instead.',
}

function atHku(place) {
  // Most people will type a short building name. Pin it to HKU
  // so Google does not pick a same-named place somewhere else.
  if (/hong kong|hku|university of hong kong/i.test(place)) {
    return place
  }
  return `${place}, University of Hong Kong`
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

// Google's LatLng object as a plain { lat, lng }.
function toPoint(latLng) {
  return { lat: latLng.lat(), lng: latLng.lng() }
}

// A small round marker, styled in Map.css. Used for "you are here" and a typed starting point.
function dotMarker(className) {
  const dot = document.createElement('div')
  dot.className = className
  return dot
}

function MapPage() {
  const { post, isLoading: isRouting } = usePost('/api/directions')
  const mapDiv = useRef(null)
  const mapRef = useRef(null)
  const mapsRef = useRef(null)
  const watchIdRef = useRef(null)
  const userMarker = useRef(null)
  const routeLine = useRef(null)
  const routeMarkers = useRef([]) // the pins at the ends of the current route
  const hasRoute = useRef(false)
  const followsRef = useRef(false) // true when the route starts at the visitor, so it follows them
  const locationRef = useRef(null)
  const stepsRef = useRef([])
  const stepIndexRef = useRef(0)
  const routeOrigin = useRef(null)
  const modeRef = useRef('2d')
  const lastCamera = useRef(null)

  // The refs above are read inside Google Maps and location callbacks, which keep the values
  // from when they were created. The state below is what the page shows.
  const [locationState, setLocationState] = useState('finding') // or found, blocked, unavailable, unsupported
  const [start, setStart] = useState('') // a typed starting point; empty means "my location"
  const [building, setBuilding] = useState('')
  const [routeMessage, setRouteMessage] = useState(null) // the last route's summary, or why it failed
  const [steps, setSteps] = useState([])
  const [stepIndex, setStepIndex] = useState(0)
  const [followsMe, setFollowsMe] = useState(true)
  const [mode, setMode] = useState('2d')

  const usesMyLocation = start.trim() === ''

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
    if (next === '2d') {
      showFlatMap()
      return
    }
    lastCamera.current = null
    // Look from the visitor when the route starts where they are (or there is no route yet),
    // otherwise from the start of the route.
    const point = followsRef.current || !routeLine.current
      ? locationRef.current
      : toPoint(routeLine.current.getPath().getAt(0))
    if (point) {
      followIn3d(point, true)
    } else {
      mapRef.current?.moveCamera({ tilt: 45, zoom: 18 })
    }
  }

  // A new position from the browser: move the blue dot and, on a walk from here, the turns.
  function handlePosition(position) {
    const here = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    }
    const isFirst = !locationRef.current
    locationRef.current = here
    setLocationState('found')

    const map = mapRef.current
    const maps = mapsRef.current
    if (!map || !maps) return

    if (!userMarker.current) {
      userMarker.current = new maps.marker.AdvancedMarkerElement({
        map,
        position: here,
        title: 'You are here',
        content: dotMarker('map-you-are-here'),
      })
    } else {
      userMarker.current.position = here
    }
    if (isFirst && !hasRoute.current) map.setCenter(here)

    if (hasRoute.current && followsRef.current) {
      const turnChanged = advanceSteps(here)
      followIn3d(here, turnChanged)
    } else if (!hasRoute.current && modeRef.current === '3d') {
      followIn3d(here)
    }
  }

  function handleLocationError(error) {
    if (error.code === error.PERMISSION_DENIED) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null // so pressing My location asks again
      setLocationState('blocked')
    } else if (!locationRef.current) {
      setLocationState('unavailable')
    }
    // A later hiccup (for example a timeout indoors) keeps the last known position.
  }

  // Follow the visitor's location. Runs when the page opens, and again when My location is
  // pressed, for example after they allow location in the browser.
  function startWatching() {
    if (!navigator.geolocation) {
      setLocationState('unsupported')
      return
    }
    if (watchIdRef.current != null) return // already following
    setLocationState(locationRef.current ? 'found' : 'finding')
    // watchPosition keeps the marker moving as you walk.
    watchIdRef.current = navigator.geolocation.watchPosition(handlePosition, handleLocationError, {
      enableHighAccuracy: true,
      maximumAge: 5000,
    })
  }

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      setRouteMessage('Add VITE_GOOGLE_MAPS_API_KEY to the root .env and restart the app.')
      return
    }

    let cancelled = false

    loadGoogleMaps(apiKey)
      .then((maps) => {
        if (cancelled || !mapDiv.current) return

        mapRef.current = new maps.Map(mapDiv.current, {
          center: HKU_CAMPUS,
          zoom: 16,
          // Tilt and the newer markers only work on a vector map with a map id.
          // DEMO_MAP_ID is Google's test id for that.
          mapId: 'DEMO_MAP_ID',
          renderingType: 'VECTOR',
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        })
        mapsRef.current = maps
        startWatching()
      })
      .catch(() => {
        if (!cancelled) setRouteMessage('Google Maps did not load. Check the API key.')
      })

    return () => {
      cancelled = true
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
  }, [])

  function chooseMyLocation() {
    setStart('')
    startWatching()
    if (locationRef.current && mapRef.current && !hasRoute.current) {
      mapRef.current.panTo(locationRef.current)
    }
  }

  // Takes the old route off the map. Runs before every new search, so a failed search
  // never leaves an old line on the map without its turns.
  function clearRoute() {
    if (routeLine.current) routeLine.current.setMap(null)
    routeLine.current = null
    routeMarkers.current.forEach((marker) => {
      marker.map = null
    })
    routeMarkers.current = []
    hasRoute.current = false
    rememberSteps([], 0)
  }

  async function onSearch(event) {
    event.preventDefault()
    const destination = building.trim()
    const startPlace = start.trim()
    if (!destination || !mapRef.current) return

    // Start from the typed place, or else from where the visitor is.
    let origin
    if (startPlace) {
      origin = atHku(startPlace)
    } else if (locationRef.current) {
      origin = locationRef.current
    } else {
      setRouteMessage(
        locationState === 'finding'
          ? 'Still finding your location. Wait a moment, or type where you are starting from.'
          : 'Type where you are starting from, or allow location and press My location.',
      )
      return
    }

    // Our server calls Google. The page key is only allowed to show the map.
    const result = await post({ origin, destination: atHku(destination) })
    clearRoute()
    if (result.error) {
      // Prefer the server's own message over the status code text.
      setRouteMessage(result.data?.error || result.error)
      return
    }

    const data = result.data
    const maps = mapsRef.current
    const map = mapRef.current
    const path = maps.geometry.encoding.decodePath(data.polyline)

    routeLine.current = new maps.Polyline({
      path,
      map,
      strokeColor: '#024638',
      strokeWeight: 6,
    })
    // A pin where the walk ends. A walk from a typed place also gets a dot where it starts;
    // a walk from here already starts at the blue "you are here" dot.
    routeMarkers.current = [
      new maps.marker.AdvancedMarkerElement({ map, position: path.at(-1), title: destination }),
    ]
    if (startPlace) {
      routeMarkers.current.push(
        new maps.marker.AdvancedMarkerElement({
          map,
          position: path[0],
          title: startPlace,
          content: dotMarker('map-start-dot'),
        }),
      )
    }

    const follows = !startPlace
    followsRef.current = follows
    setFollowsMe(follows)
    routeOrigin.current = follows ? locationRef.current : null
    rememberSteps(
      data.steps.map((step) => ({ text: plainText(step.text), lat: step.lat, lng: step.lng })),
      0,
    )
    hasRoute.current = true
    setRouteMessage(walkSummary(data.distanceMeters, data.durationSeconds) + (follows ? '' : ` from ${startPlace}`))

    if (modeRef.current === '3d') {
      lastCamera.current = null
      followIn3d(follows ? locationRef.current : toPoint(path[0]), true)
    } else {
      const bounds = new maps.LatLngBounds()
      path.forEach((point) => bounds.extend(point))
      map.fitBounds(bounds)
    }
  }

  // Walking from here: only the next turns, which move on as you walk. From a typed place: all of them.
  const shownSteps = followsMe ? steps.slice(stepIndex, stepIndex + STEPS_ON_SCREEN) : steps
  const status = isRouting ? 'Finding a walking route…' : routeMessage || 'Choose where to go and press Walk there.'
  const locationHint = usesMyLocation && locationState !== 'found' ? LOCATION_HINTS[locationState] : null

  return (
    <div className="map-page">
      <PageBanner
        title="Campus map"
        description="Walking directions to any HKU building. Start from where you are, or type a starting point."
      />

      <section className="map-card" aria-label="Walking directions">
        <form className="map-search" onSubmit={onSearch}>
          <div className="map-field">
            <label htmlFor="map-start">From</label>
            <div className="map-start">
              <button type="button" className="map-locate" aria-pressed={usesMyLocation} onClick={chooseMyLocation}>
                <Icon name="pin" /> My location
              </button>
              <input
                id="map-start"
                list="hku-buildings"
                maxLength={200}
                onChange={(event) => setStart(event.target.value)}
                placeholder="or type a place"
                autoComplete="off"
                value={start}
              />
            </div>
          </div>
          <div className="map-field">
            <label htmlFor="map-end">To</label>
            <input
              id="map-end"
              list="hku-buildings"
              maxLength={200}
              onChange={(event) => setBuilding(event.target.value)}
              placeholder="e.g. HKU Main Library"
              autoComplete="off"
              required
              value={building}
            />
          </div>
          <button type="submit" className="map-go" disabled={isRouting}>
            Walk there
          </button>
          <datalist id="hku-buildings">
            {BUILDING_SUGGESTIONS.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </form>

        <p className="map-status" role="status">{status}</p>
        {locationHint && <p className="map-hint">{locationHint}</p>}

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
          {shownSteps.length > 0 && (
            <ol className="map-steps" aria-label="Directions">
              {shownSteps.map((step, offset) => (
                <li key={(followsMe ? stepIndex : 0) + offset}>{step.text}</li>
              ))}
            </ol>
          )}
        </div>
      </section>
    </div>
  )
}

export default MapPage
