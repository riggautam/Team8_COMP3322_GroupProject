const express = require('express')
const rateLimit = require('express-rate-limit')

const router = express.Router()

// Each "Walk there" asks Google's Routes API from HKU's network, and the server guide warns HKU
// gets blocked for repeated requests. This limit is separate from the course lookups' one, so
// using the map doesn't use up someone's matches. Like that one: per account when logged in,
// per IP address when logged out, with a higher limit because a whole class can share one IP.
const directionsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: (req) => (req.session.userId ? 30 : 60),
  // ipKeyGenerator groups IPv6 addresses properly, so one device can't dodge the limit.
  keyGenerator: (req) =>
    req.session.userId ? `user-${req.session.userId}` : rateLimit.ipKeyGenerator(req.ip),
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many route requests. Please try again in an hour.' },
})

const MAX_PLACE_LENGTH = 200

// Where the walk starts, in the shape Google's Routes API wants, or null if it isn't valid.
// It is either the visitor's location { lat, lng } or a place name typed on the map page.
function readOrigin(origin) {
  if (typeof origin === 'string') {
    const place = origin.trim()
    if (!place || place.length > MAX_PLACE_LENGTH) return null
    return { address: place }
  }
  // Number.isFinite is false for anything that isn't a real number, such as "22" or NaN.
  if (
    Number.isFinite(origin?.lat) &&
    Number.isFinite(origin?.lng) &&
    Math.abs(origin.lat) <= 90 &&
    Math.abs(origin.lng) <= 180
  ) {
    return { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } }
  }
  return null
}

// The browser map key cannot request walking directions, so the server asks Google.
// Body: { origin: { lat, lng } or "a place name", destination: "a place name" }.
router.post('/', directionsLimiter, async (req, res) => {
  const origin = readOrigin(req.body?.origin)
  const destination = typeof req.body?.destination === 'string' ? req.body.destination.trim() : ''

  if (!origin) {
    return res.status(400).json({ error: 'Choose where to start: your location or a place name.' })
  }
  if (!destination || destination.length > MAX_PLACE_LENGTH) {
    return res
      .status(400)
      .json({ error: `Choose a building to walk to (${MAX_PLACE_LENGTH} characters at most).` })
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Server is missing GOOGLE_MAPS_API_KEY.' })
  }

  try {
    const googleResponse = await fetch(
      'https://routes.googleapis.com/directions/v2:computeRoutes',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask':
            'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs.steps.navigationInstruction.instructions,routes.legs.steps.endLocation',
        },
        body: JSON.stringify({
          origin,
          destination: { address: destination },
          travelMode: 'WALK',
        }),
      },
    )

    const data = await googleResponse.json()
    if (!googleResponse.ok) {
      const message = data.error?.message || ''
      console.error('Routes API error:', googleResponse.status, message)
      // Google answers 400 when it can't find one of the places, but also for a bad API key.
      // A key problem is the server's fault, so it falls through to the 502 below.
      if (googleResponse.status === 400 && !/api key/i.test(message)) {
        return res
          .status(404)
          .json({ error: 'Could not find one of those places. Try a fuller name, like "HKU Main Library".' })
      }
      return res.status(502).json({ error: 'Google could not plan a route right now. Please try again later.' })
    }
    const route = data.routes?.[0]
    if (!route?.polyline?.encodedPolyline) {
      return res.status(404).json({ error: 'No walking route found between those places.' })
    }

    const steps = (route.legs?.[0]?.steps || [])
      .map((step) => {
        const text = step.navigationInstruction?.instructions
        const lat = step.endLocation?.latLng?.latitude
        const lng = step.endLocation?.latLng?.longitude
        if (!text || typeof lat !== 'number' || typeof lng !== 'number') return null
        return { text, lat, lng }
      })
      .filter(Boolean)

    res.json({
      distanceMeters: route.distanceMeters,
      durationSeconds: Number.parseInt(route.duration, 10) || 0,
      polyline: route.polyline.encodedPolyline,
      steps,
    })
  } catch (error) {
    console.error(error)
    res.status(502).json({ error: 'Could not reach Google for directions.' })
  }
})

module.exports = router
