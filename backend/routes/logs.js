const express   = require('express')
const mongoose  = require('mongoose')
const router    = express.Router()
const GameLog   = require('../models/GameLog')
const { requireAuth } = require('../middleware/auth')

// Convert string _id from JWT → proper ObjectId
const toObjId = (id) => {
  try { return new mongoose.Types.ObjectId(id) }
  catch { return id }
}

// POST /api/logs — upsert
router.post('/', requireAuth, async (req, res) => {
  try {
    const userId  = toObjId(req.user._id)
    const steamId = req.user.steamId
    const { appId, gameName, headerImage, status, rating, hoursLogged, notes, startDate, finishDate } = req.body

    const log = await GameLog.findOneAndUpdate(
      { userId, appId },
      { userId, steamId, appId, gameName, headerImage, status, rating, hoursLogged, notes, startDate, finishDate },
      { upsert: true, new: true }
    )
    res.json({ log })
  } catch (err) {
    console.error('Log save error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/logs/my
router.get('/my', requireAuth, async (req, res) => {
  try {
    const userId = toObjId(req.user._id)
    const q = { userId }
    if (req.query.status) q.status = req.query.status
    const logs = await GameLog.find(q).sort({ updatedAt: -1 })
    res.json({ logs })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET /api/logs/check/:appId
router.get('/check/:appId', requireAuth, async (req, res) => {
  try {
    const userId = toObjId(req.user._id)
    const log = await GameLog.findOne({ userId, appId: req.params.appId })
    res.json({ log })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// DELETE /api/logs/:appId
router.delete('/:appId', requireAuth, async (req, res) => {
  try {
    const userId = toObjId(req.user._id)
    await GameLog.findOneAndDelete({ userId, appId: req.params.appId })
    res.json({ message: 'Deleted' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
