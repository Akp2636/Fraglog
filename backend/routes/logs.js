const express  = require('express')
const mongoose = require('mongoose')
const router   = express.Router()
const GameLog  = require('../models/GameLog')
const Activity = require('../models/Activity')
const { requireAuth } = require('../middleware/auth')

const toObjId = (id) => { try { return new mongoose.Types.ObjectId(String(id)) } catch { return null } }

router.post('/', requireAuth, async (req, res) => {
  try {
    const steamId  = req.user.steamId
    const userId   = toObjId(req.user._id)
    const appIdStr = String(req.body.appId)
    const { gameName, headerImage, status, rating, hoursLogged, notes, startDate, finishDate } = req.body

    if (!steamId) return res.status(400).json({ error: 'No steamId in token — log out and back in' })
    console.log(`📝 Log: ${req.user.username} steamId=${steamId} appId=${appIdStr} status=${status}`)

    // Delete orphan docs
    const nuked = await GameLog.deleteMany({ appId: appIdStr, steamId: { $ne: steamId } })
    if (nuked.deletedCount > 0) console.log(`🧹 Deleted ${nuked.deletedCount} orphan docs`)

    let log = await GameLog.findOne({ steamId, appId: appIdStr })
    const isNew = !log

    if (log) {
      if (status)         log.status      = status
      if (rating != null) log.rating      = rating
      if (hoursLogged)    log.hoursLogged = hoursLogged
      if (notes != null)  log.notes       = notes
      if (startDate)      log.startDate   = startDate
      if (finishDate)     log.finishDate  = finishDate
      await log.save()
    } else {
      log = await GameLog.create({
        steamId, userId, appId: appIdStr,
        gameName: gameName || 'Unknown',
        headerImage: headerImage || '',
        status: status || 'want_to_play',
        rating: rating || null, hoursLogged: hoursLogged || 0,
        notes: notes || '', startDate: startDate || null, finishDate: finishDate || null,
      })
    }

    // Record activity
    await Activity.create({
      steamId, username: req.user.username, avatar: req.user.avatar,
      type: isNew ? 'LOG_GAME' : 'UPDATE_LOG',
      data: { appId: appIdStr, gameName: gameName || log.gameName, status: status || log.status, rating },
    }).catch(() => {}) // non-fatal

    console.log(`✅ Log saved: steamId=${log.steamId} appId=${log.appId}`)
    res.json({ log })
  } catch (err) {
    console.error('❌ Log error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

router.get('/my', requireAuth, async (req, res) => {
  try {
    const logs = await GameLog.find({ steamId: req.user.steamId }).sort({ updatedAt: -1 })
    res.json({ logs })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/check/:appId', requireAuth, async (req, res) => {
  try {
    const log = await GameLog.findOne({ steamId: req.user.steamId, appId: String(req.params.appId) })
    console.log(`🔍 Check appId=${req.params.appId} steamId=${req.user.steamId} → ${log ? log.status : 'null'}`)
    res.json({ log: log || null })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.delete('/:appId', requireAuth, async (req, res) => {
  try {
    await GameLog.deleteMany({ steamId: req.user.steamId, appId: String(req.params.appId) })
    res.json({ message: 'Deleted' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/debug/:appId', async (req, res) => {
  try {
    const docs = await GameLog.find({ appId: String(req.params.appId) }).lean()
    res.json({ count: docs.length, docs: docs.map(d => ({ _id: d._id, steamId: d.steamId, appId: d.appId, status: d.status })) })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
