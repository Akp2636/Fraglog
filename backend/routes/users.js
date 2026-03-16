const express   = require('express')
const mongoose  = require('mongoose')
const axios     = require('axios')
const router    = express.Router()
const User      = require('../models/User')
const Review    = require('../models/Review')
const GameLog   = require('../models/GameLog')
const { requireAuth } = require('../middleware/auth')

const STEAM_KEY = process.env.STEAM_API_KEY

const toObjId = (id) => {
  try { return new mongoose.Types.ObjectId(String(id)) } catch { return null }
}

// GET /api/users/:steamId — profile + stats
router.get('/:steamId', async (req, res) => {
  try {
    const user = await User.findOne({ steamId: req.params.steamId }).select('-__v')
    if (!user) return res.status(404).json({ error: 'User not found' })

    const [reviewCount, allLogs] = await Promise.all([
      Review.countDocuments({ steamId: req.params.steamId }),
      GameLog.find({ steamId: req.params.steamId }),
    ])

    const logCount     = allLogs.length
    const ratedLogs    = allLogs.filter(l => l.rating)
    const avgRating    = ratedLogs.length
      ? +(ratedLogs.reduce((s, l) => s + l.rating, 0) / ratedLogs.length).toFixed(1)
      : null
    const statusCounts = allLogs.reduce((acc, l) => {
      acc[l.status] = (acc[l.status] || 0) + 1; return acc
    }, {})

    console.log(`👤 Profile ${req.params.steamId}: logs=${logCount} reviews=${reviewCount}`)
    res.json({ user, stats: { reviewCount, logCount, avgRating, statusCounts } })
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
    const total  = games.length
    games        = games.slice(+offset, +offset + +limit)
    const appIds = games.map(g => String(g.appid))

    // Fetch all logs for this user at once
    const allLogs = await GameLog.find({ steamId: req.params.steamId, appId: { $in: appIds } })
    const logMap  = {}
    allLogs.forEach(l => { logMap[l.appId] = l })

    const enriched = games.map(g => ({
      appid            : g.appid,
      name             : g.name,
      playtime_forever : g.playtime_forever,
      playtime_2weeks  : g.playtime_2weeks || 0,
      rtime_last_played: g.rtime_last_played,
      log              : logMap[String(g.appid)] || null,
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
    const reviews = await Review.find({ steamId: req.params.steamId }).sort({ createdAt: -1 }).limit(50)
    res.json({ reviews })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET /api/users/:steamId/logs
router.get('/:steamId/logs', async (req, res) => {
  try {
    let logs = await GameLog.find({ steamId: req.params.steamId }).sort({ updatedAt: -1 })
    if (req.query.status) logs = logs.filter(l => l.status === req.query.status)
    res.json({ logs })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// PATCH /api/users/me/bio
router.patch('/me/bio', requireAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      toObjId(req.user._id),
      { bio: (req.body.bio || '').slice(0, 500) },
      { new: true }
    )
    res.json({ user })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
