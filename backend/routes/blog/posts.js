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
      'SELECT DISTINCT category FROM blog_posts WHERE is_published = TRUE AND published_at <= NOW() ORDER BY category',
    )
    const categoryNames = categories.map((row) => row.category)

    if (category && category !== 'All' && !categoryNames.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' })
    }

    const conditions = ['is_published = TRUE', 'published_at <= NOW()']
    const values = []
    if (category && category !== 'All') {
      conditions.push('category = ?')
      values.push(category)
    }

    const [posts] = await pool.query(
      `SELECT id, slug, title, author,
        DATE_FORMAT(published_at, '%Y-%m-%dT%H:%i:%s+08:00') AS publishedAt,
        read_time_minutes AS readTimeMinutes, category, excerpt, featured, tags
       FROM blog_posts
       WHERE ${conditions.join(' AND ')}
       ORDER BY published_at DESC
       LIMIT 100`,
      values,
    )

    res.json({
      categories: categoryNames,
      posts: posts.map((post) => ({
        ...post,
        readTime: `${post.readTimeMinutes} min read`,
      })),
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router
