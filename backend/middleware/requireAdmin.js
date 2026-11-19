const pool = require('../db')

// True if this user id belongs to an admin. The role is read from the database every time
// (not stored in the session), so taking someone's admin role away works straight away.
async function isAdmin(userId) {
  if (!userId) return false
  const [rows] = await pool.query('SELECT role FROM users WHERE id = ?', [userId])
  return rows[0]?.role === 'admin'
}

// Put this in front of a route to allow only admins: 401 if logged out, 403 if not an admin.
async function requireAdmin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Please log in to do that.' })
  }
  if (!(await isAdmin(req.session.userId))) {
    return res.status(403).json({ error: 'Only admins can do that.' })
  }
  next()
}

module.exports = { requireAdmin, isAdmin }
