const express = require('express');
const cors = require('cors'); // Essential to allow your React app to talk to this API
const app = express();
const PORT = process.env.PORT || 5000;

const pool = require('./db'); // db test

app.use(cors());
app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.json({ message: "Hello backend!" });
});

// The browser map key can draw the map, but Google rejects directions
// calls that come straight from the page. This asks Google from the server.
app.post('/api/directions', async (req, res) => {
  const origin = req.body?.origin;
  const destination = typeof req.body?.destination === 'string'
    ? req.body.destination.trim()
    : '';

  if (!origin || typeof origin.lat !== 'number' || typeof origin.lng !== 'number' || !destination) {
    return res.status(400).json({ error: 'Need your location and a building name.' });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server is missing GOOGLE_MAPS_API_KEY.' });
  }

  try {
    const googleRes = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs.steps.navigationInstruction.instructions,routes.legs.steps.endLocation',
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
    });

    const data = await googleRes.json();
    const route = data.routes?.[0];
    if (!route?.polyline?.encodedPolyline) {
      return res.status(404).json({ error: 'No walking route found for that building.' });
    }

    // Each step ends at a point. The page uses that point to drop
    // the instruction once the person has walked up to it.
    const steps = (route.legs?.[0]?.steps || [])
      .map((step) => {
        const text = step.navigationInstruction?.instructions;
        const lat = step.endLocation?.latLng?.latitude;
        const lng = step.endLocation?.latLng?.longitude;
        if (!text || typeof lat !== 'number' || typeof lng !== 'number') return null;
        return { text, lat, lng };
      })
      .filter(Boolean);

    res.json({
      distanceMeters: route.distanceMeters,
      durationSeconds: Number.parseInt(route.duration, 10) || 0,
      polyline: route.polyline.encodedPolyline,
      steps,
    });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: 'Could not reach Google for directions.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

//db test
app.get('/api/health/db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS ok');
    res.json({ db: 'connected', result: rows[0].ok });
  } catch (err) {
    console.error(err);
    res.status(500).json({ db: 'error', message: err.message });
  }
});