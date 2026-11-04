const express = require('express')
const pool = require('../../db')

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const [posts] = await pool.query(
      `SELECT id, title, author,
        DATE_FORMAT(published_at, '%Y-%m-%dT%H:%i:%s+08:00') AS publishedAt
       FROM blog_posts
       WHERE is_published = TRUE AND published_at <= NOW()
       ORDER BY published_at DESC
       LIMIT 3`,
    )
    const [foodSpots] = await pool.query(
      'SELECT id, name, cuisine, walk_minutes AS walkMinutes FROM food_spots ORDER BY name',
    )

    res.json({ latestPosts: posts, foodSpots })
  } catch (error) {
    next(error)
  }
})

module.exports = router
