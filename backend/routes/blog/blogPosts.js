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

// GET all comments for a specific post
router.get('/:id/comments', async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT 
        blog_comments.id, 
        blog_comments.content, 
        blog_comments.created_at,
        COALESCE(users.display_name, 'Anonymous') AS author
      FROM blog_comments
      LEFT JOIN users ON blog_comments.author_id = users.id
      WHERE blog_comments.post_id = ?
      ORDER BY blog_comments.created_at ASC;
    `;
    const [rows] = await db.query(query, [id]);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// POST a new comment on a specific post
router.post('/:id/comments', async (req, res) => {
  const { id } = req.params;
  const { content, author_id } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Comment content cannot be empty' });
  }

  const parsedAuthorId = author_id ? parseInt(author_id, 10) : null;

  try {
    const query = `
      INSERT INTO blog_comments (post_id, content, author_id, created_at)
      VALUES (?, ?, ?, NOW());
    `;
    const [result] = await db.query(query, [id, content.trim(), parsedAuthorId]);

    // Fetch newly created comment
    const [newComment] = await db.query(`
      SELECT 
        blog_comments.id, 
        blog_comments.content, 
        blog_comments.created_at,
        COALESCE(users.display_name, 'Anonymous') AS author
      FROM blog_comments
      LEFT JOIN users ON blog_comments.author_id = users.id
      WHERE blog_comments.id = ?;
    `, [result.insertId]);

    res.status(201).json(newComment[0]);
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

module.exports = router;