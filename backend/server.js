const express = require('express');
const cors = require('cors'); // Essential to allow your React app to talk to this API
const eventsRouter = require('./routes/events');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.json({ message: "Hello backend!" });
});

app.use('/api/events', eventsRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
