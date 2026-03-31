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

// ── GET /api/users/search  ← MUST be before /:steamId ──────────────────────
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query
    if (!q || q.trim().length < 2) return res.json({ users: [] })
    const users = await User.find({
      username: { $regex: q.trim(), $options: 'i' }
    }).select('steamId username avatar bio').limit(10)
    res.json({ users })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── GET /api/users/:steamId — profile + stats ───────────────────────────────
router.get('/:steamId', async (req, res) => {
  try {
    const user = await User.findOne({ steamId: req.params.steamId }).select('-__v')
    if (!user) return res.status(404).json({ error: 'User not found' })

    const [reviewCount, allLogs, followerCount, followingCount] = await Promise.all([
      Review.countDocuments({ steamId: req.params.steamId }),
      GameLog.find({ steamId: req.params.steamId }),
      // Try Follow model if it exists, otherwise return 0
      safeCount('Follow', { followingId: req.params.steamId }),
      safeCount('Follow', { followerId:  req.params.steamId }),
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
    res.json({ user, stats: { reviewCount, logCount, avgRating, statusCounts, followerCount, followingCount } })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── GET /api/users/:steamId/library ────────────────────────────────────────
router.get('/:steamId/library', async (req, res) => {
  const { sort = 'playtime', limit = 200, offset = 0 } = req.query
  const steamId = req.params.steamId

  // ── Step 1: Fetch from Steam API ──────────────────────────────────────────
  let steamGames   = []
  let steamError   = null
  let isPrivate    = false

  if (!STEAM_KEY) {
    steamError = 'STEAM_API_KEY is not configured on the server.'
    console.error('❌ STEAM_API_KEY missing from environment variables!')
  } else {
    try {
      const steamRes = await axios.get(
        'https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/',
        {
          params: {
            key                    : STEAM_KEY,
            steamid                : steamId,
            include_appinfo        : true,
            include_played_free_games: true,
          },
          timeout: 20000,
        }
      )
      const response = steamRes.data?.response || {}

      if (response.game_count === 0 || (response.game_count === undefined && !response.games)) {
        // Steam returned a valid response but no games — profile is likely private
        isPrivate  = true
        steamError = 'Steam profile is private. Go to Steam → Edit Profile → Privacy Settings → Game Details → set to Public.'
        console.warn(`⚠️  ${steamId}: Steam returned no games (profile may be private)`)
      } else {
        steamGames = response.games || []
        console.log(`✅ Steam library for ${steamId}: ${steamGames.length} games`)
      }
    } catch (err) {
      steamError = `Steam API error: ${err.message}`
      console.error(`❌ Steam library fetch failed for ${steamId}:`, err.message)
    }
  }

  // ── Step 2: Always fetch Fraglog logs (fallback display) ──────────────────
  const allLogs = await GameLog.find({ steamId }).sort({ updatedAt: -1 }).catch(() => [])
  const logMap  = {}
  allLogs.forEach(l => { logMap[l.appId] = l })

  // ── Step 3: Build response ────────────────────────────────────────────────
  if (steamGames.length > 0) {
    // Sort steam games
    if (sort === 'playtime')    steamGames.sort((a, b) => b.playtime_forever - a.playtime_forever)
    else if (sort === 'recent') steamGames.sort((a, b) => (b.rtime_last_played || 0) - (a.rtime_last_played || 0))
    else if (sort === 'name')   steamGames.sort((a, b) => a.name.localeCompare(b.name))

    const total  = steamGames.length
    const paged  = steamGames.slice(+offset, +offset + +limit)
    const appIds = paged.map(g => String(g.appid))

    // Re-fetch only the relevant logs for this page
    const pageLogs = await GameLog.find({ steamId, appId: { $in: appIds } }).catch(() => [])
    const pageLogMap = {}
    pageLogs.forEach(l => { pageLogMap[l.appId] = l })

    const enriched = paged.map(g => ({
      appid            : g.appid,
      name             : g.name,
      playtime_forever : g.playtime_forever || 0,
      playtime_2weeks  : g.playtime_2weeks  || 0,
      rtime_last_played: g.rtime_last_played,
      log              : pageLogMap[String(g.appid)] || null,
    }))

    return res.json({ games: enriched, total, steamError: null, isPrivate: false })
  }

  // ── Fallback: Steam failed — show only logged games ───────────────────────
  if (allLogs.length > 0) {
    console.log(`ℹ️  Showing ${allLogs.length} logged games as fallback for ${steamId}`)
    const fallbackGames = allLogs.map(log => ({
      appid            : parseInt(log.appId, 10) || log.appId,
      name             : log.gameName,
      playtime_forever : log.hoursLogged * 60 || 0,
      playtime_2weeks  : 0,
      rtime_last_played: null,
      log              : log,
    }))
    return res.json({
      games     : fallbackGames,
      total     : fallbackGames.length,
      steamError,
      isPrivate,
      fallback  : true, // client can show a banner
    })
  }

  // ── Truly empty ───────────────────────────────────────────────────────────
  return res.json({ games: [], total: 0, steamError, isPrivate, fallback: false })
})

// ── GET /api/users/:steamId/reviews ────────────────────────────────────────
router.get('/:steamId/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ steamId: req.params.steamId })
      .sort({ createdAt: -1 }).limit(50)
    res.json({ reviews })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── GET /api/users/:steamId/logs ────────────────────────────────────────────
router.get('/:steamId/logs', async (req, res) => {
  try {
    let logs = await GameLog.find({ steamId: req.params.steamId }).sort({ updatedAt: -1 })
    if (req.query.status) logs = logs.filter(l => l.status === req.query.status)
    res.json({ logs })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── PATCH /api/users/me/bio ─────────────────────────────────────────────────
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

// ── PATCH /api/users/me/favorites ──────────────────────────────────────────
router.patch('/me/favorites', requireAuth, async (req, res) => {
  try {
    const { games } = req.body
    if (!Array.isArray(games)) return res.status(400).json({ error: 'games must be array' })
    const favorites = games.slice(0, 4).map(g => ({
      appId      : String(g.appId),
      name       : g.name || '',
      headerImage: g.headerImage || `https://cdn.akamai.steamstatic.com/steam/apps/${g.appId}/header.jpg`,
    }))
    const user = await User.findByIdAndUpdate(
      toObjId(req.user._id),
      { favoriteGames: favorites },
      { new: true }
    )
    res.json({ user })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ── Helper: safely count a collection that might not exist yet ──────────────
async function safeCount(modelName, query) {
  try {
    const M = mongoose.models[modelName]
    if (!M) return 0
    return await M.countDocuments(query)
  } catch { return 0 }
}

module.exports = router
