const express = require('express');
const router  = express.Router();
const GameLog = require('../models/GameLog');

const auth = (req, res, next) => {
  if (!req.session?.user) return res.status(401).json({ error: 'Not authenticated' });
  next();
};

// ── POST /api/logs — upsert ───────────────────────────────────────────────────
router.post('/', auth, async (req, res) => {
  try {
    const { _id, steamId } = req.session.user;
    const { appId, gameName, headerImage, status, rating, hoursLogged, notes, startDate, finishDate } = req.body;

    const log = await GameLog.findOneAndUpdate(
      { userId: _id, appId },
      { userId: _id, steamId, appId, gameName, headerImage, status, rating, hoursLogged, notes, startDate, finishDate },
      { upsert: true, new: true }
    );
    res.json({ log });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/logs/my ──────────────────────────────────────────────────────────
router.get('/my', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const q = { userId: req.session.user._id };
    if (status) q.status = status;
    const logs = await GameLog.find(q).sort({ updatedAt: -1 });
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/logs/check/:appId ────────────────────────────────────────────────
router.get('/check/:appId', auth, async (req, res) => {
  try {
    const log = await GameLog.findOne({ userId: req.session.user._id, appId: req.params.appId });
    res.json({ log });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/logs/:appId ───────────────────────────────────────────────────
router.delete('/:appId', auth, async (req, res) => {
  try {
    await GameLog.findOneAndDelete({ userId: req.session.user._id, appId: req.params.appId });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
