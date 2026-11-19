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

// The browser map key cannot request walking directions, so the server asks Google.
router.post('/', directionsLimiter, async (req, res) => {
  const origin = req.body?.origin
  const destination =
    typeof req.body?.destination === 'string'
      ? req.body.destination.trim()
      : ''

  if (
    !origin ||
    typeof origin.lat !== 'number' ||
    typeof origin.lng !== 'number' ||
    !destination
  ) {
    return res.status(400).json({ error: 'Need your location and a building name.' })
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
          origin: {
            location: {
              latLng: { latitude: origin.lat, longitude: origin.lng },
            },
          },
          destination: { address: destination },
          travelMode: 'WALK',
        }),
      },
    )

    const data = await googleResponse.json()
    const route = data.routes?.[0]
    if (!route?.polyline?.encodedPolyline) {
      return res.status(404).json({ error: 'No walking route found for that building.' })
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
