const express   = require('express')
const mongoose  = require('mongoose')
const router    = express.Router()
const Review    = require('../models/Review')
const User      = require('../models/User')
const Activity  = require('../models/Activity')
const { requireAuth } = require('../middleware/auth')

const toObjId = (id) => { try { return new mongoose.Types.ObjectId(String(id)) } catch { return null } }

router.get('/feed', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query
    const reviews  = await Review.find().sort({ createdAt: -1 }).skip(+offset).limit(+limit)
    const steamIds = [...new Set(reviews.map(r => r.steamId))]
    const users    = await User.find({ steamId: { $in: steamIds } }).select('steamId username avatar')
    const userMap  = {}
    users.forEach(u => { userMap[u.steamId] = u })
    res.json({ reviews: reviews.map(r => ({ ...r.toObject(), author: userMap[r.steamId] || null })) })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/', requireAuth, async (req, res) => {
  try {
    const userId  = toObjId(req.user._id)
    const steamId = req.user.steamId
    const { appId, gameName, gameHeaderImage, title, body, rating, containsSpoilers, playedOn, hoursAtReview } = req.body
    const existing = await Review.findOne({ userId, appId })
    if (existing) return res.status(400).json({ error: 'You already reviewed this game. Edit it instead.' })
    const review = await Review.create({ userId, steamId, appId, gameName, gameHeaderImage, title, body, rating, containsSpoilers, playedOn, hoursAtReview })

    await Activity.create({
      steamId, username: req.user.username, avatar: req.user.avatar,
      type: 'REVIEW',
      data: { appId, gameName, rating, title, reviewId: review._id },
    }).catch(() => {})

    res.status(201).json({ review })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

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

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
    if (!review) return res.status(404).json({ error: 'Not found' })
    if (review.steamId !== req.user.steamId) return res.status(403).json({ error: 'Forbidden' })
    await review.deleteOne()
    res.json({ message: 'Deleted' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

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
