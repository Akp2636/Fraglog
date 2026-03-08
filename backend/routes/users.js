const express = require('express');
const axios = require('axios');
const router = express.Router();
const User = require('../models/User');
const Review = require('../models/Review');
const GameLog = require('../models/GameLog');
const { isAuthenticated } = require('../middleware/authMiddleware');

const STEAM_API_BASE = 'https://api.steampowered.com';
const STEAM_KEY = () => process.env.STEAM_API_KEY;

// GET /api/users/:steamId — public profile
router.get('/:steamId', async (req, res) => {
  try {
    const { steamId } = req.params;
    const user = await User.findOne({ steamId }).lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [reviewCount, logCount] = await Promise.all([
      Review.countDocuments({ userId: user._id }),
      GameLog.countDocuments({ userId: user._id }),
    ]);

    const statusCounts = await GameLog.aggregate([
      { $match: { userId: user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const statusMap = {};
    statusCounts.forEach((s) => {
      statusMap[s._id] = s.count;
    });

    res.json({
      ...user,
      reviewCount,
      logCount,
      statusCounts: statusMap,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// GET /api/users/:steamId/library — fetch Steam library
router.get('/:steamId/library', async (req, res) => {
  try {
    const { steamId } = req.params;
    const { sort = 'playtime', limit = 50, offset = 0 } = req.query;

    const response = await axios.get(`${STEAM_API_BASE}/IPlayerService/GetOwnedGames/v1/`, {
      params: {
        key: STEAM_KEY(),
        steamid: steamId,
        include_appinfo: true,
        include_played_free_games: true,
        format: 'json',
      },
      timeout: 10000,
    });

    const games = response.data?.response?.games || [];

    // Sort
    if (sort === 'playtime') {
      games.sort((a, b) => b.playtime_forever - a.playtime_forever);
    } else if (sort === 'name') {
      games.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'recent') {
      games.sort((a, b) => (b.rtime_last_played || 0) - (a.rtime_last_played || 0));
    }

    // Update user's cached stats
    const totalPlaytime = games.reduce((sum, g) => sum + (g.playtime_forever || 0), 0);
    await User.findOneAndUpdate(
      { steamId },
      { totalGamesOwned: games.length, totalPlaytimeMinutes: totalPlaytime }
    );

    const sliced = games.slice(Number(offset), Number(offset) + Number(limit));

    res.json({
      total: games.length,
      games: sliced.map((g) => ({
        appId: String(g.appid),
        name: g.name,
        playtimeMinutes: g.playtime_forever || 0,
        playtime2Weeks: g.playtime_2weeks || 0,
        imgIconUrl: g.img_icon_url
          ? `https://media.steampowered.com/steamcommunity/public/images/apps/${g.appid}/${g.img_icon_url}.jpg`
          : null,
        headerImage: `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/header.jpg`,
        lastPlayed: g.rtime_last_played ? new Date(g.rtime_last_played * 1000) : null,
      })),
    });
  } catch (err) {
    console.error('Library fetch error:', err.message);
    if (err.response?.status === 403) {
      return res.status(403).json({ error: 'Steam profile is private. Make your profile public to sync your library.' });
    }
    res.status(500).json({ error: 'Failed to fetch Steam library' });
  }
});

// GET /api/users/:steamId/recent — recently played games
router.get('/:steamId/recent', async (req, res) => {
  try {
    const { steamId } = req.params;

    const response = await axios.get(`${STEAM_API_BASE}/IPlayerService/GetRecentlyPlayedGames/v1/`, {
      params: {
        key: STEAM_KEY(),
        steamid: steamId,
        count: 10,
        format: 'json',
      },
      timeout: 8000,
    });

    const games = response.data?.response?.games || [];

    res.json(
      games.map((g) => ({
        appId: String(g.appid),
        name: g.name,
        playtimeMinutes: g.playtime_forever || 0,
        playtime2Weeks: g.playtime_2weeks || 0,
        headerImage: `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/header.jpg`,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recent games' });
  }
});

// GET /api/users/:steamId/reviews
router.get('/:steamId/reviews', async (req, res) => {
  try {
    const { steamId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const user = await User.findOne({ steamId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const skip = (Number(page) - 1) * Number(limit);
    const [reviews, total] = await Promise.all([
      Review.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Review.countDocuments({ userId: user._id }),
    ]);

    res.json({ reviews, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// GET /api/users/:steamId/logs
router.get('/:steamId/logs', async (req, res) => {
  try {
    const { steamId } = req.params;
    const { status, page = 1, limit = 20 } = req.query;
    const user = await User.findOne({ steamId });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const query = { userId: user._id };
    if (status) query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [logs, total] = await Promise.all([
      GameLog.find(query).sort({ updatedAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      GameLog.countDocuments(query),
    ]);

    res.json({ logs, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// PATCH /api/users/me/bio — update bio (authenticated)
router.patch('/me/bio', isAuthenticated, async (req, res) => {
  try {
    const { bio } = req.body;
    if (typeof bio !== 'string' || bio.length > 300) {
      return res.status(400).json({ error: 'Bio must be 300 characters or less' });
    }

    const user = await User.findByIdAndUpdate(req.user._id, { bio }, { new: true });
    res.json({ bio: user.bio });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update bio' });
  }
});

// PATCH /api/users/me/favorites — set favorite games
router.patch('/me/favorites', isAuthenticated, async (req, res) => {
  try {
    const { favoriteGames } = req.body;
    if (!Array.isArray(favoriteGames) || favoriteGames.length > 4) {
      return res.status(400).json({ error: 'Provide up to 4 favorite games' });
    }

    const user = await User.findByIdAndUpdate(req.user._id, { favoriteGames }, { new: true });
    res.json({ favoriteGames: user.favoriteGames });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update favorites' });
  }
});

module.exports = router;
