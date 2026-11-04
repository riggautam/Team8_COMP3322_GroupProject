const express = require('express');
const router = express.Router();
const db = require('../../db');

// GET all blog posts (joins with users to fetch display_name)
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        blog_posts.id, 
        blog_posts.title, 
        blog_posts.content, 
        blog_posts.created_at,
        COALESCE(users.display_name, 'Anonymous') AS author
      FROM blog_posts
      LEFT JOIN users ON blog_posts.author_id = users.id
      ORDER BY blog_posts.created_at DESC;
    `;
    const [rows] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching blog posts:', err);
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

// POST a new blog post
router.post('/', async (req, res) => {
  const { title, content, author_id } = req.body;
  
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  const parsedAuthorId = author_id ? parseInt(author_id, 10) : null;

  try {
    const query = `
      INSERT INTO blog_posts (title, content, author_id, created_at)
      VALUES (?, ?, ?, NOW());
    `;
    const [result] = await db.query(query, [title, content, parsedAuthorId]);
    
    // Fetch newly inserted post joined with the user's display_name
    const [newPost] = await db.query(`
      SELECT 
        blog_posts.id, 
        blog_posts.title, 
        blog_posts.content, 
        blog_posts.created_at,
        COALESCE(users.display_name, 'Anonymous') AS author
      FROM blog_posts
      LEFT JOIN users ON blog_posts.author_id = users.id
      WHERE blog_posts.id = ?;
    `, [result.insertId]);

    res.status(201).json(newPost[0]);
  } catch (err) {
    console.error('Error creating blog post:', err);
    res.status(500).json({ error: 'Failed to create blog post' });
  }
});

module.exports = router;