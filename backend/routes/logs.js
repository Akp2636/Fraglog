const express = require('express');
const router = express.Router();
const GameLog = require('../models/GameLog');
const { isAuthenticated } = require('../middleware/authMiddleware');

const VALID_STATUSES = ['playing', 'played', 'want_to_play', 'dropped', 'on_hold'];

// POST /api/logs — create or update a game log entry (upsert)
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { appId, gameName, gameHeaderImage, status, rating, hoursLogged, notes, startDate, finishDate } = req.body;

    if (!appId || !gameName || !status) {
      return res.status(400).json({ error: 'appId, gameName, and status are required' });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    const update = {
      userId: req.user._id,
      steamId: req.user.steamId,
      appId: String(appId),
      gameName,
      gameHeaderImage: gameHeaderImage || `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`,
      status,
      rating: rating || null,
      hoursLogged: hoursLogged || 0,
      notes: notes || '',
      startDate: startDate || null,
      finishDate: finishDate || null,
    };

    const log = await GameLog.findOneAndUpdate(
      { userId: req.user._id, appId: String(appId) },
      update,
      { upsert: true, new: true, runValidators: true }
    );

    res.status(201).json(log);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save game log' });
  }
});

// GET /api/logs/my — get current user's logs
router.get('/my', isAuthenticated, async (req, res) => {
  try {
    const { status } = req.query;
    const query = { userId: req.user._id };
    if (status && VALID_STATUSES.includes(status)) query.status = status;

    const logs = await GameLog.find(query).sort({ updatedAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// GET /api/logs/check/:appId — check if current user has a log for a game
router.get('/check/:appId', isAuthenticated, async (req, res) => {
  try {
    const log = await GameLog.findOne({ userId: req.user._id, appId: req.params.appId });
    res.json({ log: log || null });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check log' });
  }
});

// DELETE /api/logs/:appId — remove log for a game
router.delete('/:appId', isAuthenticated, async (req, res) => {
  try {
    const result = await GameLog.findOneAndDelete({
      userId: req.user._id,
      appId: req.params.appId,
    });

    if (!result) return res.status(404).json({ error: 'Log entry not found' });

    res.json({ message: 'Log entry removed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete log' });
  }
});

module.exports = router;
