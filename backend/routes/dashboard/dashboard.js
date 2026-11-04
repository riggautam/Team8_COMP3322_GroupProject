const express = require('express')
const pool = require('../../db')

const router = express.Router()

router.get('/', async (req, res, next) => {
  try {
    const [posts] = await pool.query(
      `SELECT blog_posts.id, blog_posts.title,
         COALESCE(users.display_name, 'Anonymous') AS author,
         DATE_FORMAT(blog_posts.created_at, '%Y-%m-%dT%H:%i:%s+08:00') AS publishedAt
       FROM blog_posts
       LEFT JOIN users ON blog_posts.author_id = users.id
       ORDER BY blog_posts.created_at DESC
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
