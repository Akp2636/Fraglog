const express = require('express')
const axios   = require('axios')
const router  = express.Router()
const Review  = require('../models/Review')
const GameLog = require('../models/GameLog')

// GET /api/games/search?q=
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query
    if (!q) return res.json({ games: [] })
    const r = await axios.get(
      `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(q)}&l=english&cc=US`,
      { timeout: 10000 }
    )
    res.json({ games: r.data?.items || [] })
  } catch (err) { res.status(500).json({ error: err.message, games: [] }) }
})

// GET /api/games/trending
router.get('/trending', async (req, res) => {
  try {
    const top = await Review.aggregate([
      { $group: { _id: '$appId', count: { $sum: 1 }, gameName: { $first: '$gameName' }, headerImage: { $first: '$gameHeaderImage' } } },
      { $sort: { count: -1 } },
      { $limit: 12 },
    ])
    res.json({ games: top })
  } catch (err) { res.status(500).json({ error: err.message, games: [] }) }
})

// GET /api/games/:appId
router.get('/:appId', async (req, res) => {
  try {
    const { appId } = req.params
    const [storeRes, reviewStats] = await Promise.all([
      axios.get(`https://store.steampowered.com/api/appdetails?appids=${appId}&l=english`, { timeout: 10000 }),
      Review.aggregate([
        { $match: { appId } },
        { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
      ]),
    ])

    const data = storeRes.data?.[appId]
    if (!data?.success) return res.status(404).json({ error: 'Game not found' })

    // Only count logs with a real steamId (exclude corrupt docs)
    const logCount = await GameLog.countDocuments({
      appId,
      steamId: { $exists: true, $nin: [null, '', 'undefined'] }
    })

    res.json({
      game: data.data,
      fraglog: {
        avgRating  : reviewStats[0]?.avgRating ? +reviewStats[0].avgRating.toFixed(1) : null,
        reviewCount: reviewStats[0]?.count || 0,
        logCount,
      },
    })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET /api/games/:appId/reviews
router.get('/:appId/reviews', async (req, res) => {
  try {
    const { sort = 'recent', limit = 10, offset = 0 } = req.query
    const sortObj  = sort === 'popular' ? { likes: -1 } : { createdAt: -1 }
    const reviews  = await Review.find({ appId: req.params.appId }).sort(sortObj).skip(+offset).limit(+limit)
    const total    = await Review.countDocuments({ appId: req.params.appId })
    res.json({ reviews, total })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
