const express  = require('express')
const router   = express.Router()
const Follow   = require('../models/Follow')
const User     = require('../models/User')
const Activity = require('../models/Activity')
const { requireAuth } = require('../middleware/auth')

// POST /api/follows/:steamId — toggle follow
router.post('/:steamId', requireAuth, async (req, res) => {
  try {
    const followerId  = req.user.steamId
    const followingId = req.params.steamId

    if (followerId === followingId)
      return res.status(400).json({ error: 'Cannot follow yourself' })

    const existing = await Follow.findOne({ followerId, followingId })
    if (existing) {
      await existing.deleteOne()
      return res.json({ following: false, message: 'Unfollowed' })
    }

    await Follow.create({ followerId, followingId })

    // Record activity
    const followingUser = await User.findOne({ steamId: followingId }).select('username avatar')
    await Activity.create({
      steamId : followerId,
      username: req.user.username,
      avatar  : req.user.avatar,
      type    : 'FOLLOW',
      data    : {
        targetSteamId: followingId,
        targetUsername: followingUser?.username || followingId,
      },
    })

    res.json({ following: true, message: 'Followed' })
  } catch (err) {
    if (err.code === 11000) return res.json({ following: true, message: 'Already following' })
    res.status(500).json({ error: err.message })
  }
})

// GET /api/follows/:steamId/status — is current user following?
router.get('/:steamId/status', requireAuth, async (req, res) => {
  try {
    const doc = await Follow.findOne({ followerId: req.user.steamId, followingId: req.params.steamId })
    res.json({ following: !!doc })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET /api/follows/:steamId/followers
router.get('/:steamId/followers', async (req, res) => {
  try {
    const docs     = await Follow.find({ followingId: req.params.steamId }).sort({ createdAt: -1 }).limit(100)
    const steamIds = docs.map(d => d.followerId)
    const users    = await User.find({ steamId: { $in: steamIds } }).select('steamId username avatar bio')
    res.json({ users, count: users.length })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET /api/follows/:steamId/following
router.get('/:steamId/following', async (req, res) => {
  try {
    const docs     = await Follow.find({ followerId: req.params.steamId }).sort({ createdAt: -1 }).limit(100)
    const steamIds = docs.map(d => d.followingId)
    const users    = await User.find({ steamId: { $in: steamIds } }).select('steamId username avatar bio')
    res.json({ users, count: users.length })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET /api/follows/:steamId/counts
router.get('/:steamId/counts', async (req, res) => {
  try {
    const [followers, following] = await Promise.all([
      Follow.countDocuments({ followingId: req.params.steamId }),
      Follow.countDocuments({ followerId:  req.params.steamId }),
    ])
    res.json({ followers, following })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
