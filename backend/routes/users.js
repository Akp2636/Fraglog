const express  = require('express')
const axios    = require('axios')
const router   = express.Router()
const User     = require('../models/User')
const Review   = require('../models/Review')
const GameLog  = require('../models/GameLog')
const { requireAuth } = require('../middleware/auth')

const STEAM_KEY = process.env.STEAM_API_KEY

// GET /api/users/:steamId
router.get('/:steamId', async (req, res) => {
  try {
    const user = await User.findOne({ steamId: req.params.steamId }).select('-__v')
    if (!user) return res.status(404).json({ error: 'User not found' })
    const [reviewCount, logCount, logsWithStatus] = await Promise.all([
      Review.countDocuments({ steamId: req.params.steamId }),
      GameLog.countDocuments({ steamId: req.params.steamId }),
      GameLog.find({ steamId: req.params.steamId }).select('status rating'),
    ])
    const avgRating = logsWithStatus.filter(l => l.rating).reduce((sum, l, _, arr) => sum + l.rating / arr.length, 0)
    const statusCounts = logsWithStatus.reduce((acc, l) => { acc[l.status] = (acc[l.status] || 0) + 1; return acc }, {})
    res.json({ user, stats: { reviewCount, logCount, avgRating: avgRating ? +avgRating.toFixed(1) : null, statusCounts } })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET /api/users/:steamId/library
router.get('/:steamId/library', async (req, res) => {
  try {
    const { sort = 'playtime', limit = 200, offset = 0 } = req.query
    const steamRes = await axios.get('https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/', {
      params: { key: STEAM_KEY, steamid: req.params.steamId, include_appinfo: true, include_played_free_games: true },
      timeout: 15000,
    })
    let games = steamRes.data?.response?.games || []
    if (sort === 'playtime')    games.sort((a, b) => b.playtime_forever - a.playtime_forever)
    else if (sort === 'recent') games.sort((a, b) => (b.rtime_last_played || 0) - (a.rtime_last_played || 0))
    else if (sort === 'name')   games.sort((a, b) => a.name.localeCompare(b.name))
    const total = games.length
    games = games.slice(+offset, +offset + +limit)
    const appIds = games.map(g => String(g.appid))
    const logs   = await GameLog.find({ steamId: req.params.steamId, appId: { $in: appIds } })
    const logMap = {}
    logs.forEach(l => { logMap[l.appId] = l })
    const enriched = games.map(g => ({
      appid           : g.appid, name: g.name,
      playtime_forever: g.playtime_forever,
      playtime_2weeks : g.playtime_2weeks || 0,
      rtime_last_played: g.rtime_last_played,
      headerImage     : `https://cdn.akamai.steamstatic.com/steam/apps/${g.appid}/header.jpg`,
      log             : logMap[String(g.appid)] || null,
    }))
    res.json({ games: enriched, total })
  } catch (err) {
    console.error('Library error:', err.message)
    res.status(500).json({ error: 'Failed to fetch library', games: [], total: 0 })
  }
})

// GET /api/users/:steamId/reviews
router.get('/:steamId/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ steamId: req.params.steamId }).sort({ createdAt: -1 }).limit(20)
    res.json({ reviews })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET /api/users/:steamId/logs
router.get('/:steamId/logs', async (req, res) => {
  try {
    const { status } = req.query
    const q = { steamId: req.params.steamId }
    if (status) q.status = status
    const logs = await GameLog.find(q).sort({ updatedAt: -1 })
    res.json({ logs })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// PATCH /api/users/me/bio
router.patch('/me/bio', requireAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { bio: (req.body.bio || '').slice(0, 500) },
      { new: true }
    )
    res.json({ user })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
