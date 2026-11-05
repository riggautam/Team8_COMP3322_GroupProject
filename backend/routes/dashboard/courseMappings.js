const express = require('express')
const pool = require('../../db')
const requireAuth = require('../../middleware/requireAuth')

const router = express.Router()
const MAX_CODE_LENGTH = 30
const MAX_CREDITS = 30
const STATUSES = ['pending', 'approved', 'rejected']

// Every course mapping route needs a logged-in user.
router.use(requireAuth)

router.param('id', (req, res, next, id) => {
  if (!/^[1-9]\d*$/.test(id)) {
    return res.status(400).json({ error: 'Invalid course mapping id.' })
  }
  next()
})

// mysql2 returns DECIMAL as a string, so turn credits back into a number.
function toMapping(row) {
  return {
    id: row.id,
    hkuCode: row.hku_code,
    homeCode: row.home_code,
    credits: Number(row.credits),
    status: row.status,
  }
}

function courseCode(value) {
  return typeof value === 'string' ? value.trim().toUpperCase() : ''
}

router.get('/', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, hku_code, home_code, credits, status FROM course_mappings WHERE user_id = ? ORDER BY id',
    [req.session.userId],
  )
  res.json({ data: rows.map(toMapping) })
})

router.post('/', async (req, res) => {
  const hkuCode = courseCode(req.body?.hkuCode)
  const homeCode = courseCode(req.body?.homeCode)
  const credits = Number(req.body?.credits)

  if (!hkuCode || !homeCode) {
    return res.status(400).json({ error: 'Enter both the HKU and home course codes.' })
  }
  if (hkuCode.length > MAX_CODE_LENGTH || homeCode.length > MAX_CODE_LENGTH) {
    return res.status(400).json({ error: `Course codes must be ${MAX_CODE_LENGTH} characters or fewer.` })
  }
  if (!Number.isFinite(credits) || credits <= 0 || credits > MAX_CREDITS) {
    return res.status(400).json({ error: `Credits must be more than 0 and at most ${MAX_CREDITS}.` })
  }

  const [result] = await pool.query(
    'INSERT INTO course_mappings (user_id, hku_code, home_code, credits) VALUES (?, ?, ?, ?)',
    [req.session.userId, hkuCode, homeCode, credits],
  )
  res.status(201).json({
    data: { id: result.insertId, hkuCode, homeCode, credits, status: 'pending' },
  })
})

// Checking user_id as well means nobody can change another student's mappings.
router.patch('/:id', async (req, res) => {
  const status = req.body?.status
  if (!STATUSES.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${STATUSES.join(', ')}.` })
  }

  const [result] = await pool.query(
    'UPDATE course_mappings SET status = ? WHERE id = ? AND user_id = ?',
    [status, req.params.id, req.session.userId],
  )
  if (result.affectedRows === 0) {
    return res.status(404).json({ error: 'Course mapping not found.' })
  }
  res.json({ data: { id: Number(req.params.id), status } })
})

router.delete('/:id', async (req, res) => {
  const [result] = await pool.query(
    'DELETE FROM course_mappings WHERE id = ? AND user_id = ?',
    [req.params.id, req.session.userId],
  )
  if (result.affectedRows === 0) {
    return res.status(404).json({ error: 'Course mapping not found.' })
  }
  res.status(204).end()
})

module.exports = router