const express = require('express')
const rateLimit = require('express-rate-limit')
const pool = require('../../db')
const requireAuth = require('../../middleware/requireAuth')
const { isAdmin } = require('../../middleware/requireAdmin')

const router = express.Router()

// A fixed list, because the dashboard gives each category its own colour.
const CATEGORIES = ['Academic', 'Social', 'Food', 'Culture', 'Sports']
const MAX_TITLE_LENGTH = 255
const MAX_LOCATION_LENGTH = 255
const MAX_DESCRIPTION_LENGTH = 2000
const MAX_DAYS = 366 // the list reaches at most this many days ahead
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000
const HONG_KONG_OFFSET_MS = 8 * 60 * 60 * 1000

// Per account, since adding events needs a login. Only events that were really added count,
// so a form sent back with a 400 doesn't use up the limit.
const createEventLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 10,
  keyGenerator: (req) => `user-${req.session.userId}`,
  skipFailedRequests: true,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'You have added too many events. Please try again later.' },
})

// Every route sends events in this shape. startsAt is Hong Kong time with its +08:00 offset.
// Events with no creator are the sample ones, shown as added by "WEST".
const EVENT_FIELDS = `
  SELECT events.id, events.title, events.category,
    DATE_FORMAT(events.starts_at, '%Y-%m-%dT%H:%i:%s+08:00') AS startsAt,
    events.location, events.description,
    events.created_by AS createdById,
    COALESCE(users.display_name, 'WEST') AS createdBy
  FROM events
  LEFT JOIN users ON users.id = events.created_by`

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}

// Turns "2026-11-20T18:30" (Hong Kong time, as a datetime-local input sends it) into a Date,
// or null if it isn't a real date and time. JavaScript quietly turns 31 February into 3 March,
// so the Date is turned back into text, and it must come out the same as what was sent.
function parseHongKongTime(value) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null
  const time = new Date(`${value}:00+08:00`)
  if (Number.isNaN(time.getTime())) return null
  // toISOString() prints UTC, so moving the time 8 hours on prints the Hong Kong clock time.
  const sameText = new Date(time.getTime() + HONG_KONG_OFFSET_MS).toISOString().slice(0, 16)
  return sameText === value ? time : null
}

// Returns the cleaned fields, or an error message for a 400 response.
// keptStartsAt is set on an edit: the event's current time may stay even after it has passed,
// so a typo in an event that has already started can still be fixed.
function readEventFields(body, keptStartsAt) {
  const title = text(body?.title)
  const category = text(body?.category)
  const startsAt = text(body?.startsAt)
  const location = text(body?.location)
  const description = text(body?.description) // optional

  if (!title || !location) {
    return { error: 'Title and location are required.' }
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return { error: `Title must be ${MAX_TITLE_LENGTH} characters or fewer.` }
  }
  if (location.length > MAX_LOCATION_LENGTH) {
    return { error: `Location must be ${MAX_LOCATION_LENGTH} characters or fewer.` }
  }
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    return { error: `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.` }
  }
  if (!CATEGORIES.includes(category)) {
    return { error: `Category must be one of: ${CATEGORIES.join(', ')}.` }
  }

  const time = parseHongKongTime(startsAt)
  if (!time) {
    return { error: 'Start time must be a real date and time, like 2026-11-20T18:30.' }
  }
  if (startsAt !== keptStartsAt) {
    if (time.getTime() <= Date.now()) {
      return { error: 'Start time must be in the future.' }
    }
    if (time.getTime() > Date.now() + ONE_YEAR_MS) {
      return { error: 'Start time must be within a year from now.' }
    }
  }

  // MySQL DATETIME text, e.g. "2026-11-20 18:30:00". MySQL stores it as written: Hong Kong time.
  return { title, category, startsAt: `${startsAt.replace('T', ' ')}:00`, location, description }
}

// Runs before any route with :id, so a bad id gets a 400 instead of a database query.
router.param('id', (req, res, next, id) => {
  if (!/^[1-9]\d*$/.test(id)) {
    return res.status(400).json({ error: 'Invalid event id.' })
  }
  next()
})

// Allows the event's creator or an admin. The sample events have no creator, so only an admin
// can change them. Keeps the event's current start time for the edit route.
async function requireEventOwnerOrAdmin(req, res, next) {
  const [rows] = await pool.query(
    "SELECT created_by, DATE_FORMAT(starts_at, '%Y-%m-%dT%H:%i') AS startsAt FROM events WHERE id = ?",
    [req.params.id],
  )
  if (!rows[0]) {
    return res.status(404).json({ error: 'Event not found.' })
  }
  if (rows[0].created_by !== req.session.userId && !(await isAdmin(req.session.userId))) {
    return res.status(403).json({ error: 'You can only change your own events.' })
  }
  req.currentStartsAt = rows[0].startsAt
  next()
}

// Express 5 sends errors from async routes to the error handler in server.js as a 500.

// Today's and upcoming events: from the start of today (Hong Kong time) for `days` days.
// ?days=1 is today only. Hidden events are left out.
router.get('/', async (req, res) => {
  const category = req.query.category
  const days = req.query.days ?? String(MAX_DAYS)

  if (category && !CATEGORIES.includes(category)) {
    return res.status(400).json({ error: `Category must be one of: ${CATEGORIES.join(', ')}.` })
  }
  if (typeof days !== 'string' || !/^\d{1,3}$/.test(days) || Number(days) < 1 || Number(days) > MAX_DAYS) {
    return res.status(400).json({ error: `days must be a whole number from 1 to ${MAX_DAYS}.` })
  }

  const conditions = [
    'events.hidden = FALSE',
    'events.starts_at >= CURDATE()',
    'events.starts_at < CURDATE() + INTERVAL ? DAY',
  ]
  const values = [Number(days)]
  if (category) {
    conditions.push('events.category = ?')
    values.push(category)
  }

  const [events] = await pool.query(
    `${EVENT_FIELDS} WHERE ${conditions.join(' AND ')} ORDER BY events.starts_at, events.id`,
    values,
  )
  // Today's date on the server, so pages can group events by day without trusting the
  // visitor's own clock or time zone.
  const [[{ today }]] = await pool.query("SELECT DATE_FORMAT(CURDATE(), '%Y-%m-%d') AS today")

  res.json({ categories: CATEGORIES, today, events })
})

// Logged-in users can add events.
router.post('/', requireAuth, createEventLimiter, async (req, res) => {
  const fields = readEventFields(req.body)
  if (fields.error) {
    return res.status(400).json({ error: fields.error })
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO events (title, category, starts_at, location, description, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [fields.title, fields.category, fields.startsAt, fields.location, fields.description, req.session.userId],
    )
    const [rows] = await pool.query(`${EVENT_FIELDS} WHERE events.id = ?`, [result.insertId])
    res.status(201).json(rows[0])
  } catch (err) {
    // The unique key (title, starts_at) stops the same event being added twice.
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'An event with this title already starts at that time.' })
    }
    throw err
  }
})

// Only the creator (or an admin) can edit an event.
router.put('/:id', requireAuth, requireEventOwnerOrAdmin, async (req, res) => {
  const fields = readEventFields(req.body, req.currentStartsAt)
  if (fields.error) {
    return res.status(400).json({ error: fields.error })
  }

  try {
    const [result] = await pool.query(
      'UPDATE events SET title = ?, category = ?, starts_at = ?, location = ?, description = ? WHERE id = ?',
      [fields.title, fields.category, fields.startsAt, fields.location, fields.description, req.params.id],
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Event not found.' })
    }
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'An event with this title already starts at that time.' })
    }
    throw err
  }

  const [rows] = await pool.query(`${EVENT_FIELDS} WHERE events.id = ?`, [req.params.id])
  res.json(rows[0])
})

// The creator or an admin can delete an event.
router.delete('/:id', requireAuth, requireEventOwnerOrAdmin, async (req, res) => {
  const [result] = await pool.query('DELETE FROM events WHERE id = ?', [req.params.id])
  if (result.affectedRows === 0) {
    return res.status(404).json({ error: 'Event not found.' })
  }
  res.status(204).end()
})

module.exports = router
