const express = require('express')
const { CATEGORIES, getTodaysEvents } = require('../data/events')

const router = express.Router()

router.get('/', (req, res) => {
  const { category } = req.query

  if (category !== undefined && !CATEGORIES.includes(category)) {
    return res.status(400).json({ error: 'Invalid category' })
  }

  const events = getTodaysEvents().filter((event) => !category || event.category === category)
  res.json({ categories: CATEGORIES, events })
})

module.exports = router
