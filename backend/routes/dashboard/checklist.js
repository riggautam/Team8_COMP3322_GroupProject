const express = require('express')
const pool = require('../../db')
const requireAuth = require('../../middleware/requireAuth')

const router = express.Router()
const MAX_LABEL_LENGTH = 150

// Every checklist route needs a logged-in user.
router.use(requireAuth)

router.param('id', (req, res, next, id) => {
  if (!/^[1-9]\d*$/.test(id)) {
    return res.status(400).json({ error: 'Invalid checklist item id.' })
  }
  next()
})

// MySQL stores BOOLEAN as 0 or 1, so turn it into true or false for the frontend.
function toItem(row) {
  return { id: row.id, label: row.label, isDone: Boolean(row.is_done) }
}

router.get('/', async (req, res) => {
  const [rows] = await pool.query(
    'SELECT id, label, is_done FROM checklist_items WHERE user_id = ? ORDER BY id',
    [req.session.userId],
  )
  res.json({ data: rows.map(toItem) })
})

router.post('/', async (req, res) => {
  const label = typeof req.body?.label === 'string' ? req.body.label.trim() : ''
  if (!label) {
    return res.status(400).json({ error: 'Enter something for the checklist.' })
  }
  if (label.length > MAX_LABEL_LENGTH) {
    return res.status(400).json({ error: `Keep it to ${MAX_LABEL_LENGTH} characters or fewer.` })
  }

  const [result] = await pool.query(
    'INSERT INTO checklist_items (user_id, label) VALUES (?, ?)',
    [req.session.userId, label],
  )
  res.status(201).json({ data: { id: result.insertId, label, isDone: false } })
})

// Checking user_id as well means nobody can change another student's items.
router.patch('/:id', async (req, res) => {
  const { isDone } = req.body ?? {}
  if (typeof isDone !== 'boolean') {
    return res.status(400).json({ error: 'isDone must be true or false.' })
  }

  const [result] = await pool.query(
    'UPDATE checklist_items SET is_done = ? WHERE id = ? AND user_id = ?',
    [isDone, req.params.id, req.session.userId],
  )
  if (result.affectedRows === 0) {
    return res.status(404).json({ error: 'Checklist item not found.' })
  }
  res.json({ data: { id: Number(req.params.id), isDone } })
})

router.delete('/:id', async (req, res) => {
  const [result] = await pool.query(
    'DELETE FROM checklist_items WHERE id = ? AND user_id = ?',
    [req.params.id, req.session.userId],
  )
  if (result.affectedRows === 0) {
    return res.status(404).json({ error: 'Checklist item not found.' })
  }
  res.status(204).end()
})

module.exports = router