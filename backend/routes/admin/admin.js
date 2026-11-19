const express = require('express')
const pool = require('../../db')
const { requireAdmin } = require('../../middleware/requireAdmin')
const { TARGETS, isTargetType, loadPreviews } = require('./targets')

const router = express.Router()

// Every route in this file is admin-only: 401 when logged out, 403 for everyone else.
router.use(requireAdmin)

router.param('type', (req, res, next, type) => {
  if (!isTargetType(type)) {
    return res.status(400).json({ error: `Type must be one of: ${Object.keys(TARGETS).join(', ')}.` })
  }
  next()
})

router.param('id', (req, res, next, id) => {
  if (!/^[1-9]\d*$/.test(id)) {
    return res.status(400).json({ error: 'Invalid id.' })
  }
  next()
})

// Closes the open reports on one item. 'actioned' means the admin agreed (hid or deleted it),
// 'dismissed' means the admin kept it.
function resolveReports(type, id, status, adminId) {
  return pool.query(
    `UPDATE reports SET status = ?, resolved_by = ?, resolved_at = NOW()
     WHERE target_type = ? AND target_id = ? AND status = 'open'`,
    [status, adminId, type, id],
  )
}

// Adds a short preview of each reported item. item is null if it was deleted in the meantime
// (for example by its author), so the admin can just close those reports.
async function addPreviews(groups) {
  const previews = {}
  for (const type of Object.keys(TARGETS)) {
    const ids = groups.filter((group) => group.target_type === type).map((group) => group.target_id)
    previews[type] = await loadPreviews(type, ids)
  }
  return groups.map((group) => ({
    targetType: group.target_type,
    targetId: group.target_id,
    reportCount: group.report_count,
    reasons: group.reasons.split(','),
    details: group.details ? group.details.split('\n') : [],
    lastReportedAt: group.last_reported_at,
    item: previews[group.target_type].get(group.target_id) ?? null,
  }))
}

// Open reports, one entry per reported item, most-reported first.
router.get('/reports', async (req, res) => {
  const [groups] = await pool.query(`
    SELECT target_type, target_id, COUNT(*) AS report_count,
      GROUP_CONCAT(DISTINCT reason ORDER BY reason SEPARATOR ',') AS reasons,
      GROUP_CONCAT(details ORDER BY created_at SEPARATOR '\n') AS details,
      MAX(created_at) AS last_reported_at
    FROM reports
    WHERE status = 'open'
    GROUP BY target_type, target_id
    ORDER BY report_count DESC, last_reported_at DESC`)
  res.json({ data: await addPreviews(groups) })
})

// Everything currently hidden, newest first.
router.get('/hidden', async (req, res) => {
  const items = []
  for (const [type, target] of Object.entries(TARGETS)) {
    const [rows] = await pool.query(`SELECT id FROM ${target.table} WHERE hidden = TRUE`)
    const previews = await loadPreviews(type, rows.map((row) => row.id))
    for (const item of previews.values()) {
      items.push({ targetType: type, targetId: item.id, item })
    }
  }
  items.sort((a, b) => new Date(b.item.created_at) - new Date(a.item.created_at))
  res.json({ data: items })
})

// Hide or restore an item: { hidden: true | false }. Its open reports are closed either way.
router.patch('/content/:type/:id', async (req, res) => {
  const { type, id } = req.params
  const hidden = req.body?.hidden
  if (typeof hidden !== 'boolean') {
    return res.status(400).json({ error: 'hidden must be true or false.' })
  }

  const [result] = await pool.query(`UPDATE ${TARGETS[type].table} SET hidden = ? WHERE id = ?`, [hidden, id])
  if (result.affectedRows === 0) {
    return res.status(404).json({ error: 'That item was not found.' })
  }

  await resolveReports(type, id, hidden ? 'actioned' : 'dismissed', req.session.userId)
  res.json({ data: { targetType: type, targetId: Number(id), hidden } })
})

// Delete an item for good. Also closes its reports, even if the item was already gone.
router.delete('/content/:type/:id', async (req, res) => {
  const { type, id } = req.params

  // Deleting a post deletes its comments too (ON DELETE CASCADE), so close their reports as well.
  if (type === 'post') {
    await pool.query(
      `UPDATE reports SET status = 'actioned', resolved_by = ?, resolved_at = NOW()
       WHERE target_type = 'comment' AND status = 'open'
         AND target_id IN (SELECT id FROM blog_comments WHERE post_id = ?)`,
      [req.session.userId, id],
    )
  }

  const [result] = await pool.query(`DELETE FROM ${TARGETS[type].table} WHERE id = ?`, [id])
  await resolveReports(type, id, 'actioned', req.session.userId)

  if (result.affectedRows === 0) {
    return res.status(404).json({ error: 'That item was already deleted. Its reports are now closed.' })
  }
  res.status(204).end()
})

module.exports = router
