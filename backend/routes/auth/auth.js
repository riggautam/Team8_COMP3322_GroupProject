const express = require('express')
const bcrypt = require('bcryptjs')
const rateLimit = require('express-rate-limit')
const pool = require('../../db')
const crypto = require('crypto')

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

// Google's OAuth 2.0 endpoints.
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO_URL = 'https://openidconnect.googleapis.com/v1/userinfo'

// Limits for new accounts. The two maximums match the column sizes in the users table.
const MIN_PASSWORD_LENGTH = 8
const MAX_PASSWORD_LENGTH = 72 // bcrypt ignores anything after 72 bytes
const MAX_EMAIL_LENGTH = 255
const MAX_NAME_LENGTH = 100
// Text, @, text, a dot, text, with no spaces. Simple on purpose: it catches typos, not every rule.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Each IP address gets 10 failed attempts per 15 minutes, then a 429 until the window ends.
// Successful logins don't count, so normal users never hit it. This slows down password guessing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again in 15 minutes.' },
})

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

// Gives a new account the starter checklist. VALUES ? with nested arrays inserts one row per item.
function addStarterChecklist(userId) {
  return pool.query('INSERT INTO checklist_items (user_id, label) VALUES ?', [
    STARTER_CHECKLIST.map((label) => [userId, label]),
  ])
}

// Finds the account for this Google user, linking or creating one if needed. Returns the user id.
async function findOrCreateGoogleUser(profile) {
  const email = profile.email.toLowerCase()

  // 1. They have signed in with Google before.
  const [byGoogle] = await pool.query('SELECT id FROM users WHERE google_id = ?', [profile.sub])
  if (byGoogle[0]) return byGoogle[0].id

  // 2. They have a password account with the same email: link it.
  //    Safe because Google has verified they own this email.
  const [byEmail] = await pool.query('SELECT id FROM users WHERE email = ?', [email])
  if (byEmail[0]) {
    await pool.query('UPDATE users SET google_id = ? WHERE id = ?', [profile.sub, byEmail[0].id])
    return byEmail[0].id
  }

  // 3. New user: no password, and the same starter checklist as a normal sign-up.
  const displayName = (profile.name || email.split('@')[0]).slice(0, 100)
  const [result] = await pool.query(
    'INSERT INTO users (email, google_id, display_name) VALUES (?, ?, ?)',
    [email, profile.sub, displayName],
  )
  await addStarterChecklist(result.insertId)
  return result.insertId
}

router.post('/register', authLimiter, async (req, res, next) => {
  const email = field(req.body, 'email').toLowerCase()
  const password = field(req.body, 'password')
  const displayName = field(req.body, 'displayName')

  if (!email || !password || !displayName) {
    return res.status(400).json({ error: 'Name, email and password are required.' })
  }
  if (displayName.length > MAX_NAME_LENGTH) {
    return res.status(400).json({ error: `Name must be ${MAX_NAME_LENGTH} characters or fewer.` })
  }
  if (email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ error: 'Enter a valid email address.' })
  }
  if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
    return res.status(400).json({
      error: `Password must be ${MIN_PASSWORD_LENGTH} to ${MAX_PASSWORD_LENGTH} characters long.`,
    })
  }

  try {
    // Store a one-way hash, never the password itself. 10 is the cost: higher is slower to crack.
    const passwordHash = await bcrypt.hash(password, 10)

    // ? placeholders stop SQL injection: mysql2 escapes the values.
    const [result] = await pool.query(
      'INSERT INTO users (email, password, display_name) VALUES (?, ?, ?)',
      [email, passwordHash, displayName],
    )
    await addStarterChecklist(result.insertId)

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

router.post('/login', authLimiter, async (req, res, next) => {
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

    // Google-only accounts have no password (NULL), so they can't log in this way.
    // Same message for every case, so nobody can probe which emails exist.
    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
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

// Google sign-in, step 1: send the browser to Google's account picker.
router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_REDIRECT_URI) {
    return res.redirect('/login?error=google')
  }

  // A random one-time value. Google sends it back, and the callback checks it matches,
  // so nobody can trick a browser into finishing a login it never started (CSRF).
  const state = crypto.randomBytes(16).toString('hex')
  req.session.oauthState = state

  // Save first, so the state is in the database before Google sends the user back.
  req.session.save((err) => {
    if (err) return next(err)
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      response_type: 'code', // we want a one-time code, swapped for a token below
      scope: 'openid email profile',
      state,
      prompt: 'select_account', // always show the account picker
    })
    res.redirect(`${GOOGLE_AUTH_URL}?${params}`)
  })
})

// Google sign-in, step 2: Google sends the browser back here with a one-time code.
router.get('/google/callback', async (req, res) => {
  const { code, state, error } = req.query
  const expectedState = req.session.oauthState
  delete req.session.oauthState // each state can only be used once

  // error means the user pressed Cancel. A wrong state means this login did not start here.
  if (error || typeof code !== 'string' || !expectedState || state !== expectedState) {
    return res.redirect('/login?error=google')
  }

  try {
    // Swap the code for an access token. The client secret proves the request comes from our server.
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    })
    if (!tokenResponse.ok) {
      throw new Error(`Google token exchange failed with status ${tokenResponse.status}`)
    }
    const { access_token: accessToken } = await tokenResponse.json()

    // Ask Google who this token belongs to: id (sub), email, name.
    const profileResponse = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!profileResponse.ok) {
      throw new Error(`Google userinfo failed with status ${profileResponse.status}`)
    }
    const profile = await profileResponse.json()

    if (!profile.sub || !profile.email || !profile.email_verified) {
      return res.redirect('/login?error=google')
    }

    const userId = await findOrCreateGoogleUser(profile)
    await startSession(req, userId)
    res.redirect('/dashboard')
  } catch (err) {
    console.error(err)
    res.redirect('/login?error=google')
  }
})

module.exports = router