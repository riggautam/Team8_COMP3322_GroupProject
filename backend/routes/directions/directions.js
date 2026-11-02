const express = require('express')

const router = express.Router()

// The browser map key cannot request walking directions, so the server asks Google.
router.post('/', async (req, res) => {
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
