const mysql = require('mysql2/promise');

// A pool reuses a few open connections instead of opening one per request.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // MySQL runs on Hong Kong time (see docker-compose.yml), so read its dates and times
  // as +08:00 when turning them into JavaScript Dates. Change both places together.
  timezone: '+08:00',
});

module.exports = pool;