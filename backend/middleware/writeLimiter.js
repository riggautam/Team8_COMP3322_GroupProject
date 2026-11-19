const rateLimit = require('express-rate-limit')

// A ceiling on requests that change something (POST, PUT, PATCH, DELETE) anywhere under /api,
// so one account or script can't flood the database with comments, checklist items, votes and
// so on. It is generous for normal use. The tighter limits on logging in, signing up, posting
// while logged out, reports, new events and outside services still apply on top of it.
//
// Logged in: counted per account. Logged out: per IP address, with a higher limit because a
// whole class on HKU Wi-Fi or HKUVPN can share one IP (logging in counts here too).
const writeLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: (req) => (req.session.userId ? 100 : 200),
  // ipKeyGenerator groups IPv6 addresses properly, so one device can't dodge the limit.
  keyGenerator: (req) =>
    req.session.userId ? `user-${req.session.userId}` : rateLimit.ipKeyGenerator(req.ip),
  // Reading is never limited here: the dashboard refreshes itself every few seconds.
  skip: (req) => ['GET', 'HEAD', 'OPTIONS'].includes(req.method),
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many changes in a short time. Please wait a few minutes and try again.' },
})

module.exports = writeLimiter
