// Put this in front of a route to allow only logged-in users.
function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Please log in to do that.' })
  }
  next()
}

module.exports = requireAuth