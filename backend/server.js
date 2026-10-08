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

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
