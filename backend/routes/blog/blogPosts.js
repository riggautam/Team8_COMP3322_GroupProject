const express = require('express');
const db = require('../../db');
const requireAuth = require('../../middleware/requireAuth');

const router = express.Router();

const MAX_TITLE_LENGTH = 255;
const MAX_CATEGORY_LENGTH = 50;
const MAX_COMMENT_LENGTH = 5000;
const MAX_CONTENT_LENGTH = 5000;
const DEFAULT_CATEGORY = 'General';
const VOTE_VALUES = [1, -1, 0]; // up, down, remove my vote

const FEATURED_WINDOW_HOURS = 72;

// Every post comes back with three vote fields:
// score: all votes added up (each upvote +1, each downvote -1). SUM gives a DECIMAL,
//   which mysql2 returns as a string, so CAST turns it into a whole number.
// recent_score: the same, but only votes cast in the last 72 hours. The Featured sort uses it.
// my_vote: the visitor's own vote (1, -1, or 0 for none). The ? is the visitor's user id,
//   so every query that uses POST_FIELDS passes viewerId(req) as its first value.
const POST_FIELDS = `
  SELECT
    blog_posts.id,
    blog_posts.title,
    blog_posts.content,
    blog_posts.category,
    blog_posts.author_id,
    blog_posts.created_at,
    COALESCE(users.display_name, 'Anonymous') AS author,
    (SELECT CAST(COALESCE(SUM(blog_votes.value), 0) AS SIGNED)
       FROM blog_votes WHERE blog_votes.post_id = blog_posts.id) AS score,
    (SELECT CAST(COALESCE(SUM(blog_votes.value), 0) AS SIGNED)
       FROM blog_votes WHERE blog_votes.post_id = blog_posts.id
       AND blog_votes.voted_at >= NOW() - INTERVAL ${FEATURED_WINDOW_HOURS} HOUR) AS recent_score,
    COALESCE((SELECT blog_votes.value FROM blog_votes
       WHERE blog_votes.post_id = blog_posts.id AND blog_votes.user_id = ?), 0) AS my_vote
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

// The logged-in user's id, or 0 when logged out. No user has id 0, so my_vote comes back 0.
function viewerId(req) {
  return req.session.userId ?? 0;
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
  if (content.length > MAX_CONTENT_LENGTH) {
    return { error: `Content must be ${MAX_CONTENT_LENGTH} characters or fewer.` };
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
  const [rows] = await db.query(
    `${POST_FIELDS} ORDER BY blog_posts.created_at DESC, blog_posts.id DESC`,
    [viewerId(req)],
  );
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const [rows] = await db.query(`${POST_FIELDS} WHERE blog_posts.id = ?`, [
    viewerId(req),
    req.params.id,
  ]);
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
  const [rows] = await db.query(`${POST_FIELDS} WHERE blog_posts.id = ?`, [
    viewerId(req),
    result.insertId,
  ]);
  res.status(201).json(rows[0]);
});

// Only the author can edit a post.
router.put('/:id', requireAuth, requirePostOwner, async (req, res) => {
  const fields = readPostFields(req.body);
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

  const [rows] = await db.query(`${POST_FIELDS} WHERE blog_posts.id = ?`, [
    viewerId(req),
    req.params.id,
  ]);
  res.json(rows[0]);
});

// Only the author can delete a post. Its comments and votes go too (ON DELETE CASCADE).
router.delete('/:id', requireAuth, requirePostOwner, async (req, res) => {
  const [result] = await db.query('DELETE FROM blog_posts WHERE id = ?', [req.params.id]);
  if (result.affectedRows === 0) {
    return res.status(404).json({ error: 'Post not found.' });
  }
  res.status(204).end();
});

// Vote on a post: { value: 1 } up, { value: -1 } down, { value: 0 } removes your vote.
// Login is required so each person can only vote once per post.
// PUT, because sending the same vote twice leaves things exactly as after the first time.
router.put('/:id/vote', requireAuth, async (req, res) => {
  const value = req.body?.value;
  if (!VOTE_VALUES.includes(value)) {
    return res.status(400).json({ error: 'Vote must be 1, -1 or 0.' });
  }

  const [posts] = await db.query('SELECT id FROM blog_posts WHERE id = ?', [req.params.id]);
  if (!posts[0]) {
    return res.status(404).json({ error: 'Post not found.' });
  }

  if (value === 0) {
    await db.query('DELETE FROM blog_votes WHERE post_id = ? AND user_id = ?', [
      req.params.id,
      req.session.userId,
    ]);
  } else {
    // The primary key allows one row per user per post, so a second vote
    // updates the existing row (ON DUPLICATE KEY UPDATE) instead of adding another.
    await db.query(
      `INSERT INTO blog_votes (post_id, user_id, value) VALUES (?, ?, ?) AS new_vote
       ON DUPLICATE KEY UPDATE value = new_vote.value`,
      [req.params.id, req.session.userId, value],
    );
  }

  // Send back both totals, so the page can re-sort straight away for Top and Featured.
  const [rows] = await db.query(
    `SELECT
       CAST(COALESCE(SUM(value), 0) AS SIGNED) AS score,
       CAST(COALESCE(SUM(CASE WHEN voted_at >= NOW() - INTERVAL ${FEATURED_WINDOW_HOURS} HOUR
         THEN value ELSE 0 END), 0) AS SIGNED) AS recent_score
     FROM blog_votes WHERE post_id = ?`,
    [req.params.id],
  );
  res.json({ score: rows[0].score, recent_score: rows[0].recent_score, my_vote: value });
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