const express  = require('express')
const router   = express.Router()
const Activity = require('../models/Activity')
const Follow   = require('../models/Follow')
const { requireAuth } = require('../middleware/auth')

// GET /api/activity/feed — activity from people you follow
router.get('/feed', requireAuth, async (req, res) => {
  try {
    const { limit = 30, offset = 0 } = req.query
    const following = await Follow.find({ followerId: req.user.steamId }).select('followingId')
    const ids = following.map(f => f.followingId)
    // Include own activity too
    ids.push(req.user.steamId)
    const activities = await Activity.find({ steamId: { $in: ids } })
      .sort({ createdAt: -1 }).skip(+offset).limit(+limit)
    res.json({ activities })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET /api/activity/global — global activity feed
router.get('/global', async (req, res) => {
  try {
    const { limit = 30, offset = 0 } = req.query
    const activities = await Activity.find()
      .sort({ createdAt: -1 }).skip(+offset).limit(+limit)
    res.json({ activities })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET /api/activity/user/:steamId — a user's activity
router.get('/user/:steamId', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query
    const activities = await Activity.find({ steamId: req.params.steamId })
      .sort({ createdAt: -1 }).skip(+offset).limit(+limit)
    res.json({ activities })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
