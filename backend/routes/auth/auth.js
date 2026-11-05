const express = require('express')
const bcrypt = require('bcryptjs')
const pool = require('../../db')

const router = express.Router()


// Every new account starts with these. Students can tick, remove or add to them.
const STARTER_CHECKLIST = [
  'Collect student visa / HKID',
  'Get an Octopus card',
  'Open a local bank account',
  'Register for courses',
  'Submit course mapping for approval',
  'Take a campus tour',
]

// Reads a text field from the request body, or '' if it's missing.
function field(body, name) {
  return typeof body?.[name] === 'string' ? body[name].trim() : ''
}

// The only user fields sent back to the browser. Never the password.
function publicUser(user) {
  return { id: user.id, email: user.email, displayName: user.display_name }
}

// Gives the browser a brand new session id on login, then stores who logged in.
function startSession(req, userId) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((regenerateError) => {
      if (regenerateError) return reject(regenerateError)
      req.session.userId = userId
      req.session.save((saveError) => (saveError ? reject(saveError) : resolve()))
    })
  })
}

router.post('/register', async (req, res, next) => {
  const email = field(req.body, 'email').toLowerCase()
  const password = field(req.body, 'password')
  const displayName = field(req.body, 'displayName')

  if (!email || !password || !displayName) {
    return res.status(400).json({ error: 'Name, email and password are required.' })
  }

  try {
    // Store a one-way hash, never the password itself. 10 is the cost: higher is slower to crack.
    const passwordHash = await bcrypt.hash(password, 10)

    // ? placeholders stop SQL injection: mysql2 escapes the values.
    const [result] = await pool.query(
      'INSERT INTO users (email, password, display_name) VALUES (?, ?, ?)',
      [email, passwordHash, displayName],
    )
        // VALUES ? with nested arrays inserts one row per item.
    await pool.query('INSERT INTO checklist_items (user_id, label) VALUES ?', [
      STARTER_CHECKLIST.map((label) => [result.insertId, label]),
    ])
    
    await startSession(req, result.insertId)
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
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Wrong email or password.' })
    }
    await startSession(req, user.id)
    res.json({ data: publicUser(user) })
  } catch (err) {
    next(err)
  }
})

// Tells the frontend who is logged in, using the session cookie.
router.get('/me', async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not logged in.' })
  }

  try {
    const [rows] = await pool.query(
      'SELECT id, email, display_name FROM users WHERE id = ?',
      [req.session.userId],
    )
    if (!rows[0]) {
      return res.status(401).json({ error: 'Not logged in.' })
    }
    res.json({ data: publicUser(rows[0]) })
  } catch (err) {
    next(err)
  }
})

router.post('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err)
    res.clearCookie('west.sid')
    res.status(204).end()
  })
})

module.exports = router