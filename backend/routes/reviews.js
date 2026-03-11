const express  = require('express')
const router   = express.Router()
const Review   = require('../models/Review')
const User     = require('../models/User')
const { requireAuth } = require('../middleware/auth')

// GET /api/reviews/feed
router.get('/feed', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query
    const reviews = await Review.find().sort({ createdAt: -1 }).skip(+offset).limit(+limit)
    const steamIds = [...new Set(reviews.map(r => r.steamId))]
    const users    = await User.find({ steamId: { $in: steamIds } }).select('steamId username avatar')
    const userMap  = {}
    users.forEach(u => { userMap[u.steamId] = u })
    const enriched = reviews.map(r => ({ ...r.toObject(), author: userMap[r.steamId] || null }))
    res.json({ reviews: enriched })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// POST /api/reviews
router.post('/', requireAuth, async (req, res) => {
  try {
    const { appId, gameName, gameHeaderImage, title, body, rating, containsSpoilers, playedOn, hoursAtReview } = req.body
    const { _id, steamId } = req.user
    const existing = await Review.findOne({ userId: _id, appId })
    if (existing) return res.status(400).json({ error: 'You already reviewed this game. Edit it instead.' })
    const review = await Review.create({
      userId: _id, steamId, appId, gameName, gameHeaderImage,
      title, body, rating, containsSpoilers, playedOn, hoursAtReview,
    })
    res.status(201).json({ review })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// PUT /api/reviews/:id
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
    if (!review) return res.status(404).json({ error: 'Not found' })
    if (review.steamId !== req.user.steamId) return res.status(403).json({ error: 'Forbidden' })
    const { title, body, rating, containsSpoilers, playedOn, hoursAtReview } = req.body
    Object.assign(review, { title, body, rating, containsSpoilers, playedOn, hoursAtReview })
    await review.save()
    res.json({ review })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// DELETE /api/reviews/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
    if (!review) return res.status(404).json({ error: 'Not found' })
    if (review.steamId !== req.user.steamId) return res.status(403).json({ error: 'Forbidden' })
    await review.deleteOne()
    res.json({ message: 'Deleted' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// POST /api/reviews/:id/like
router.post('/:id/like', requireAuth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
    if (!review) return res.status(404).json({ error: 'Not found' })
    const sid = req.user.steamId
    const idx = review.likes.indexOf(sid)
    if (idx === -1) review.likes.push(sid)
    else review.likes.splice(idx, 1)
    await review.save()
    res.json({ liked: idx === -1, likeCount: review.likes.length })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
