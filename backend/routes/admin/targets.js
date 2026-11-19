const pool = require('../../db')

const EXCERPT_LENGTH = 200

// The kinds of content that can be reported and moderated, and where each one lives.
// Table names can't be sent as ? placeholders, so SQL only ever takes them from this list,
// never from the request. preview loads short summaries for the admin page; mysql2 turns
// IN (?) with an array into IN (1, 2, 3).
const TARGETS = {
  post: {
    table: 'blog_posts',
    preview: `
      SELECT blog_posts.id, blog_posts.title, LEFT(blog_posts.content, ${EXCERPT_LENGTH}) AS excerpt,
        blog_posts.hidden, blog_posts.created_at, COALESCE(users.display_name, 'Anonymous') AS author
      FROM blog_posts
      LEFT JOIN users ON users.id = blog_posts.author_id
      WHERE blog_posts.id IN (?)`,
  },
  comment: {
    table: 'blog_comments',
    preview: `
      SELECT blog_comments.id, blog_comments.post_id, LEFT(blog_comments.content, ${EXCERPT_LENGTH}) AS excerpt,
        blog_comments.hidden, blog_comments.created_at, COALESCE(users.display_name, 'Anonymous') AS author
      FROM blog_comments
      LEFT JOIN users ON users.id = blog_comments.author_id
      WHERE blog_comments.id IN (?)`,
  },
  event: {
    table: 'events',
    preview: `
      SELECT events.id, events.title, LEFT(events.description, ${EXCERPT_LENGTH}) AS excerpt,
        events.hidden, events.created_at, COALESCE(users.display_name, 'WEST') AS author
      FROM events
      LEFT JOIN users ON users.id = events.created_by
      WHERE events.id IN (?)`,
  },
}

// Object.hasOwn, not "in": a request can't sneak in names like "constructor".
function isTargetType(type) {
  return typeof type === 'string' && Object.hasOwn(TARGETS, type)
}

// The item's id and hidden flag, or undefined if it doesn't exist.
async function findTarget(type, id) {
  const [rows] = await pool.query(`SELECT id, hidden FROM ${TARGETS[type].table} WHERE id = ?`, [id])
  return rows[0]
}

// Previews of the given ids, as a Map from id to row.
async function loadPreviews(type, ids) {
  if (ids.length === 0) return new Map()
  const [rows] = await pool.query(TARGETS[type].preview, [ids])
  // MySQL stores BOOLEAN as 0/1, so turn hidden back into true/false for the page.
  return new Map(rows.map((row) => [row.id, { ...row, hidden: Boolean(row.hidden) }]))
}

module.exports = { TARGETS, isTargetType, findTarget, loadPreviews }
