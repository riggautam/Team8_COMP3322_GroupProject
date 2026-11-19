const express = require('express')
const rateLimit = require('express-rate-limit')
const pool = require('../../db')
const requireAuth = require('../../middleware/requireAuth')
const { TARGETS, isTargetType, findTarget } = require('../admin/targets')

const router = express.Router()

const REASONS = ['spam', 'offensive', 'personal_info', 'misleading', 'other']
const MAX_DETAILS_LENGTH = 500
// This many open reports from different people hide the item until an admin decides.
const AUTO_HIDE_REPORTS = 3

// Per account, since reporting needs a login. Stops one person flooding the admin queue.
const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 20,
  keyGenerator: (req) => `user-${req.session.userId}`,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many reports. Please try again later.' },
})

// Report a post or comment: { targetType, targetId, reason, details? }.
// requireAuth runs first, so the limiter always has a user id to count by.
router.post('/', requireAuth, reportLimiter, async (req, res) => {
  const targetType = req.body?.targetType
  const targetId = Number(req.body?.targetId)
  const reason = req.body?.reason
  const details = typeof req.body?.details === 'string' ? req.body.details.trim() : ''

  if (!isTargetType(targetType)) {
    return res.status(400).json({ error: `You can report: ${Object.keys(TARGETS).join(', ')}.` })
  }
  if (!Number.isInteger(targetId) || targetId < 1) {
    return res.status(400).json({ error: 'Invalid item id.' })
  }
  if (!REASONS.includes(reason)) {
    return res.status(400).json({ error: `Reason must be one of: ${REASONS.join(', ')}.` })
  }
  if (details.length > MAX_DETAILS_LENGTH) {
    return res.status(400).json({ error: `Details must be ${MAX_DETAILS_LENGTH} characters or fewer.` })
  }

  // Hidden items act as if they don't exist, the same as everywhere else.
  const target = await findTarget(targetType, targetId)
  if (!target || target.hidden) {
    return res.status(404).json({ error: 'That item was not found.' })
  }

  try {
    await pool.query(
      'INSERT INTO reports (reporter_id, target_type, target_id, reason, details) VALUES (?, ?, ?, ?, ?)',
      [req.session.userId, targetType, targetId, reason, details || null],
    )
  } catch (err) {
    // The unique key (reporter_id, target_type, target_id) allows one report per person per item,
    // so nobody can hide something on their own by reporting it three times.
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'You have already reported this.' })
    }
    throw err
  }

  // Enough open reports hide the item straight away, even when no admin is online.
  const [[{ openReports }]] = await pool.query(
    "SELECT COUNT(*) AS openReports FROM reports WHERE target_type = ? AND target_id = ? AND status = 'open'",
    [targetType, targetId],
  )
  const hidden = openReports >= AUTO_HIDE_REPORTS
  if (hidden) {
    await pool.query(`UPDATE ${TARGETS[targetType].table} SET hidden = TRUE WHERE id = ?`, [targetId])
  }

  res.status(201).json({ data: { targetType, targetId, hidden } })
})

module.exports = router
