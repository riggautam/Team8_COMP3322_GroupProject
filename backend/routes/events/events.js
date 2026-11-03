const express = require('express')
const pool = require('../../db')

const router = express.Router()

router.get('/', async (req, res, next) => {
  const { category } = req.query

  if (category !== undefined && typeof category !== 'string') {
    return res.status(400).json({ error: 'Invalid category' })
  }

  try {
    const [categories] = await pool.query(
      'SELECT DISTINCT category FROM events WHERE starts_at >= CURDATE() AND starts_at < CURDATE() + INTERVAL 1 DAY ORDER BY category',
    )
    const categoryNames = categories.map((row) => row.category)

    if (category && !categoryNames.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' })
    }

    const conditions = ['starts_at >= CURDATE()', 'starts_at < CURDATE() + INTERVAL 1 DAY']
    const values = []
    if (category) {
      conditions.push('category = ?')
      values.push(category)
    }

    const [events] = await pool.query(
      `SELECT id, title, category,
        DATE_FORMAT(starts_at, '%Y-%m-%dT%H:%i:%s+08:00') AS startsAt,
        location, description
       FROM events
       WHERE ${conditions.join(' AND ')}
       ORDER BY starts_at`,
      values,
    )

    res.json({ categories: categoryNames, events })
  } catch (error) {
    next(error)
  }
})

module.exports = router
