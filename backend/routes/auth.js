const express = require('express')
const pool = require('../db')

const router = express.Router()

// Reads a text field from the request body, or '' if it's missing.
function field(body, name) {
  return typeof body?.[name] === 'string' ? body[name].trim() : ''
}

// The only user fields sent back to the browser. Never the password.
function publicUser(user) {
  return { id: user.id, email: user.email, displayName: user.display_name }
}

router.post('/register', async (req, res, next) => {
  const email = field(req.body, 'email').toLowerCase()
  const password = field(req.body, 'password')
  const displayName = field(req.body, 'displayName')

  if (!email || !password || !displayName) {
    return res.status(400).json({ error: 'Name, email and password are required.' })
  }

  try {
    // ? placeholders stop SQL injection: mysql2 escapes the values.
    const [result] = await pool.query(
      'INSERT INTO users (email, password, display_name) VALUES (?, ?, ?)',
      [email, password, displayName],
    )
    res.status(201).json({ data: { id: result.insertId, email, displayName } })
  } catch (err) {
    // The UNIQUE rule on users.email rejects a second account with the same email.
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'An account with that email already exists.' })
    }
    next(err)
  }
})

router.post('/login', async (req, res, next) => {
  const email = field(req.body, 'email').toLowerCase()
  const password = field(req.body, 'password')

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' })
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, email, password, display_name FROM users WHERE email = ?',
      [email],
    )
    const user = rows[0]

    // Same message for both cases, so nobody can probe which emails exist.
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Wrong email or password.' })
    }
    res.json({ data: publicUser(user) })
  } catch (err) {
    next(err)
  }
})

module.exports = router