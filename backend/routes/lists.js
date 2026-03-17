const express   = require('express')
const mongoose  = require('mongoose')
const router    = express.Router()
const GameList  = require('../models/GameList')
const Activity  = require('../models/Activity')
const { requireAuth } = require('../middleware/auth')

// GET /api/lists — public lists (trending/recent)
router.get('/', async (req, res) => {
  try {
    const { sort = 'recent', limit = 20, offset = 0 } = req.query
    const sortObj = sort === 'popular'
      ? { 'likes': -1, createdAt: -1 }
      : { createdAt: -1 }
    const lists = await GameList.find({ isPublic: true })
      .sort(sortObj).skip(+offset).limit(+limit)
      .select('steamId username avatar title description games likes createdAt')
    const total = await GameList.countDocuments({ isPublic: true })
    res.json({ lists, total })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET /api/lists/:id — single list
router.get('/:id', async (req, res) => {
  try {
    const list = await GameList.findById(req.params.id)
    if (!list) return res.status(404).json({ error: 'List not found' })
    res.json({ list })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET /api/lists/user/:steamId — lists by user
router.get('/user/:steamId', async (req, res) => {
  try {
    const lists = await GameList.find({ steamId: req.params.steamId })
      .sort({ createdAt: -1 })
    res.json({ lists })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// POST /api/lists — create list
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, description, games, isPublic } = req.body
    if (!title?.trim()) return res.status(400).json({ error: 'Title is required' })

    const list = await GameList.create({
      steamId    : req.user.steamId,
      username   : req.user.username,
      avatar     : req.user.avatar,
      title      : title.trim(),
      description: description?.trim() || '',
      games      : (games || []).map((g, i) => ({ ...g, position: i + 1 })),
      isPublic   : isPublic !== false,
    })

    await Activity.create({
      steamId : req.user.steamId,
      username: req.user.username,
      avatar  : req.user.avatar,
      type    : 'CREATE_LIST',
      data    : { listId: list._id, listTitle: list.title },
    })

    res.status(201).json({ list })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// PUT /api/lists/:id — update list
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const list = await GameList.findById(req.params.id)
    if (!list) return res.status(404).json({ error: 'Not found' })
    if (list.steamId !== req.user.steamId) return res.status(403).json({ error: 'Forbidden' })

    const { title, description, games, isPublic } = req.body
    if (title)       list.title       = title.trim()
    if (description !== undefined) list.description = description.trim()
    if (games)       list.games       = games.map((g, i) => ({ ...g, position: i + 1 }))
    if (isPublic !== undefined) list.isPublic = isPublic
    await list.save()
    res.json({ list })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// DELETE /api/lists/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const list = await GameList.findById(req.params.id)
    if (!list) return res.status(404).json({ error: 'Not found' })
    if (list.steamId !== req.user.steamId) return res.status(403).json({ error: 'Forbidden' })
    await list.deleteOne()
    res.json({ message: 'Deleted' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// POST /api/lists/:id/like — toggle like
router.post('/:id/like', requireAuth, async (req, res) => {
  try {
    const list = await GameList.findById(req.params.id)
    if (!list) return res.status(404).json({ error: 'Not found' })
    const sid = req.user.steamId
    const idx = list.likes.indexOf(sid)
    if (idx === -1) list.likes.push(sid)
    else list.likes.splice(idx, 1)
    await list.save()
    res.json({ liked: idx === -1, likeCount: list.likes.length })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
