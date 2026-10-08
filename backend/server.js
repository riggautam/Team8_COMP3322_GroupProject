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