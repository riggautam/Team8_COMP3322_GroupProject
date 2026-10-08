const express = require('express');
const cors = require('cors'); // Essential to allow your React app to talk to this API
const { rateLimit } = require('express-rate-limit');
const eventsRouter = require('./routes/events');
const dashboardRouter = require('./routes/dashboard');
const app = express();
const PORT = process.env.PORT || 5000;
const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS || 0);
const { fetchCoursePage } = require('./routes/transfer_credit/coursePage');
const { findMatchingCourses } = require('./routes/transfer_credit/matchingCourses');
const pool = require('./db'); // db test

if (!Number.isInteger(trustProxyHops) || trustProxyHops < 0) {
  throw new Error('TRUST_PROXY_HOPS must be a non-negative integer.');
}

app.set('trust proxy', trustProxyHops);
app.use(cors());
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({
        error: 'Too many requests. Please try again in 15 minutes.',
      });
    },
  }),
);
app.use(express.json({ limit: '300kb' }));

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

app.post('/api/course-page', async (req, res) => {
  const { url } = req.body || {};

  if (typeof url !== 'string' || !url.trim()) {
    return res.status(400).json({ error: 'Enter a course description link.' });
  }

  try {
    const text = await fetchCoursePage(url.trim());
    return res.status(200).json({ text });
  } catch (error) {
    const statusCode = error.statusCode || 502;
    return res.status(statusCode).json({
      error: error.message || 'The linked page could not be fetched.',
    });
  }
});

app.post('/api/matching-courses', async (req, res) => {
  try {
    const data = await findMatchingCourses(req.body || {});
    return res.status(200).json({ data });
  } catch (error) {
    return res.status(error.statusCode || 502).json({
      error: error.message || 'Could not generate course suggestions.',
    });
  }
});

app.use('/api/dashboard', dashboardRouter);
app.use('/api/events', eventsRouter);

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

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});