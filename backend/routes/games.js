const express = require('express');
const axios = require('axios');
const router = express.Router();
const Review = require('../models/Review');
const GameLog = require('../models/GameLog');

const STEAM_STORE_API = 'https://store.steampowered.com/api';
const STEAM_API_BASE = 'https://api.steampowered.com';

// GET /api/games/search?q=query — search games via Steam store
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const response = await axios.get('https://store.steampowered.com/api/storesearch/', {
      params: {
        term: q,
        l: 'english',
        cc: 'US',
      },
      timeout: 8000,
    });

    const items = response.data?.items || [];
    const results = items.slice(0, 15).map((item) => ({
      appId: String(item.id),
      name: item.name,
      headerImage: `https://cdn.cloudflare.steamstatic.com/steam/apps/${item.id}/header.jpg`,
      price: item.price,
      platforms: item.platforms,
    }));

    res.json(results);
  } catch (err) {
    console.error('Game search error:', err.message);
    res.status(500).json({ error: 'Failed to search games' });
  }
});

// GET /api/games/:appId — get game details from Steam Store
router.get('/:appId', async (req, res) => {
  try {
    const { appId } = req.params;

    const [storeResponse, reviewData] = await Promise.all([
      axios.get(`${STEAM_STORE_API}/appdetails`, {
        params: { appids: appId, cc: 'us', l: 'en' },
        timeout: 10000,
      }),
      Review.aggregate([
        { $match: { appId } },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$rating' },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const gameData = storeResponse.data?.[appId];
    if (!gameData?.success) {
      return res.status(404).json({ error: 'Game not found on Steam' });
    }

    const data = gameData.data;
    const fraglogStats = reviewData[0] || { avgRating: null, count: 0 };

    res.json({
      appId,
      name: data.name,
      shortDescription: data.short_description,
      headerImage: data.header_image,
      background: data.background_raw || data.background,
      developers: data.developers || [],
      publishers: data.publishers || [],
      genres: data.genres?.map((g) => g.description) || [],
      categories: data.categories?.map((c) => c.description) || [],
      releaseDate: data.release_date?.date || '',
      isFree: data.is_free,
      price: data.price_overview
        ? {
            currency: data.price_overview.currency,
            initial: data.price_overview.initial,
            final: data.price_overview.final,
            discountPercent: data.price_overview.discount_percent,
            formatted: data.price_overview.final_formatted,
          }
        : null,
      metacritic: data.metacritic || null,
      steamReviewSummary: data.reviews || '',
      screenshots: (data.screenshots || []).slice(0, 6).map((s) => s.path_full),
      movies: (data.movies || []).slice(0, 2).map((m) => ({
        id: m.id,
        name: m.name,
        thumbnail: m.thumbnail,
        webm: m.webm?.['480'],
      })),
      fraglog: {
        avgRating: fraglogStats.avgRating ? Number(fraglogStats.avgRating.toFixed(2)) : null,
        reviewCount: fraglogStats.count,
      },
    });
  } catch (err) {
    console.error('Game fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch game details' });
  }
});

// GET /api/games/:appId/reviews — community reviews for a game
router.get('/:appId/reviews', async (req, res) => {
  try {
    const { appId } = req.params;
    const { sort = 'recent', page = 1, limit = 10 } = req.query;

    const sortMap = {
      recent: { createdAt: -1 },
      top: { likeCount: -1 },
      rating_high: { rating: -1 },
      rating_low: { rating: 1 },
    };

    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total] = await Promise.all([
      Review.find({ appId })
        .populate('userId', 'username avatar steamId')
        .sort(sortMap[sort] || { createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Review.countDocuments({ appId }),
    ]);

    // Add computed fields
    const enriched = reviews.map((r) => ({
      ...r,
      likeCount: r.likes?.length || 0,
    }));

    res.json({ reviews: enriched, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// GET /api/games/trending/now — get popular/trending games (top reviewed)
router.get('/trending/now', async (req, res) => {
  try {
    const trending = await Review.aggregate([
      {
        $group: {
          _id: '$appId',
          gameName: { $first: '$gameName' },
          gameHeaderImage: { $first: '$gameHeaderImage' },
          reviewCount: { $sum: 1 },
          avgRating: { $avg: '$rating' },
        },
      },
      { $sort: { reviewCount: -1 } },
      { $limit: 12 },
    ]);

    res.json(trending);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trending games' });
  }
});

module.exports = router;
