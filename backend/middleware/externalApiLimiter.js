const rateLimit = require('express-rate-limit')

// Fetch course and Transfer call outside services (course websites, OpenRouter) from HKU's network.
// The server guide warns HKU gets blocked for repeated requests, so both routes share this limit.
//
// Logged in: counted per account, so classmates on the same Wi-Fi don't use up each other's limit.
// Logged out: counted per IP address. A whole class on HKU Wi-Fi or HKUVPN can share one IP,
// so that limit is higher. One match usually takes 2 requests: fetch the page, then match.
const externalApiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: (req) => (req.session.userId ? 40 : 60),
  // ipKeyGenerator groups IPv6 addresses properly, so one device can't dodge the limit.
  keyGenerator: (req) =>
    req.session.userId ? `user-${req.session.userId}` : rateLimit.ipKeyGenerator(req.ip),
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many course lookups. Please try again in an hour.' },
})

module.exports = externalApiLimiter