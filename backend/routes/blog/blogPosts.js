const express = require('express');
const db = require('../../db');
const requireAuth = require('../../middleware/requireAuth');

const router = express.Router();

const MAX_TITLE_LENGTH = 255;
const MAX_CATEGORY_LENGTH = 50;
const MAX_COMMENT_LENGTH = 5000;
const DEFAULT_CATEGORY = 'General';

const POST_FIELDS = `
  SELECT
    blog_posts.id,
    blog_posts.title,
    blog_posts.content,
    blog_posts.category,
    blog_posts.author_id,
    blog_posts.created_at,
    COALESCE(users.display_name, 'Anonymous') AS author
  FROM blog_posts
  LEFT JOIN users ON blog_posts.author_id = users.id
`;

const COMMENT_FIELDS = `
  SELECT
    blog_comments.id,
    blog_comments.content,
    blog_comments.created_at,
    COALESCE(users.display_name, 'Anonymous') AS author
  FROM blog_comments
  LEFT JOIN users ON blog_comments.author_id = users.id
`;

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

// Returns the cleaned fields, or an error message for a 400 response.
function readPostFields(body) {
  const title = text(body?.title);
  const content = text(body?.content);
  const category = text(body?.category) || DEFAULT_CATEGORY;

  if (!title || !content) {
    return { error: 'Title and content are required.' };
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return { error: `Title must be ${MAX_TITLE_LENGTH} characters or fewer.` };
  }
  if (category.length > MAX_CATEGORY_LENGTH) {
    return { error: `Category must be ${MAX_CATEGORY_LENGTH} characters or fewer.` };
  }
  return { title, content, category };
}

// Runs before any route with :id, so a bad id gets a 400 instead of a database query.
router.param('id', (req, res, next, id) => {
  if (!/^[1-9]\d*$/.test(id)) {
    return res.status(400).json({ error: 'Invalid post id.' });
  }
  next();
});
// Allows only the post's author. Anonymous posts have no author, so nobody can change them.
async function requirePostOwner(req, res, next) {
  const [rows] = await db.query('SELECT author_id FROM blog_posts WHERE id = ?', [req.params.id]);
  if (!rows[0]) {
    return res.status(404).json({ error: 'Post not found.' });
  }
  if (rows[0].author_id !== req.session.userId) {
    return res.status(403).json({ error: 'You can only change your own posts.' });
  }
  next();
}

// Express 5 sends errors from async routes to the error handler in server.js as a 500.

router.get('/', async (req, res) => {
  const [rows] = await db.query(`${POST_FIELDS} ORDER BY blog_posts.created_at DESC, blog_posts.id DESC`);
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const [rows] = await db.query(`${POST_FIELDS} WHERE blog_posts.id = ?`, [req.params.id]);
  if (!rows[0]) {
    return res.status(404).json({ error: 'Post not found.' });
  }
  res.json(rows[0]);
});

// Anyone can post. Logged-out posts have no author and show as Anonymous.
router.post('/', async (req, res) => {
  const fields = readPostFields(req.body);
  if (fields.error) {
    return res.status(400).json({ error: fields.error });
  }

  const authorId = req.session.userId ?? null;
  const [result] = await db.query(
    'INSERT INTO blog_posts (title, content, category, author_id) VALUES (?, ?, ?, ?)',
    [fields.title, fields.content, fields.category, authorId],
  );
  const [rows] = await db.query(`${POST_FIELDS} WHERE blog_posts.id = ?`, [result.insertId]);
  res.status(201).json(rows[0]);
});

// Only the author can edit a post.
router.put('/:id', requireAuth, requirePostOwner, async (req, res) => {  const fields = readPostFields(req.body);
  if (fields.error) {
    return res.status(400).json({ error: fields.error });
  }

  const [result] = await db.query(
    'UPDATE blog_posts SET title = ?, content = ?, category = ? WHERE id = ?',
    [fields.title, fields.content, fields.category, req.params.id],
  );
  if (result.affectedRows === 0) {
    return res.status(404).json({ error: 'Post not found.' });
  }

  const [rows] = await db.query(`${POST_FIELDS} WHERE blog_posts.id = ?`, [req.params.id]);
  res.json(rows[0]);
});

// Only the author can delete a post. Its comments go too (ON DELETE CASCADE).
router.delete('/:id', requireAuth, requirePostOwner, async (req, res) => {  const [result] = await db.query('DELETE FROM blog_posts WHERE id = ?', [req.params.id]);
  if (result.affectedRows === 0) {
    return res.status(404).json({ error: 'Post not found.' });
  }
  res.status(204).end();
});

router.get('/:id/comments', async (req, res) => {
  const [posts] = await db.query('SELECT id FROM blog_posts WHERE id = ?', [req.params.id]);
  if (!posts[0]) {
    return res.status(404).json({ error: 'Post not found.' });
  }

  const [rows] = await db.query(
    `${COMMENT_FIELDS} WHERE blog_comments.post_id = ? ORDER BY blog_comments.created_at ASC, blog_comments.id ASC`,
    [req.params.id],
  );
  res.json(rows);
});

router.post('/:id/comments', async (req, res) => {
  const content = text(req.body?.content);
  if (!content) {
    return res.status(400).json({ error: 'Comment cannot be empty.' });
  }
  if (content.length > MAX_COMMENT_LENGTH) {
    return res.status(400).json({ error: `Comment must be ${MAX_COMMENT_LENGTH} characters or fewer.` });
  }

  const authorId = req.session.userId ?? null;
  try {
    const [result] = await db.query(
      'INSERT INTO blog_comments (post_id, content, author_id) VALUES (?, ?, ?)',
      [req.params.id, content, authorId],
    );
    const [rows] = await db.query(`${COMMENT_FIELDS} WHERE blog_comments.id = ?`, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    // The foreign key rejects a comment on a post that does not exist.
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(404).json({ error: 'Post not found.' });
    }
    throw err;
  }
});

module.exports = router;