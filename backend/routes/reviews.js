const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { isAuthenticated } = require('../middleware/authMiddleware');

// GET /api/reviews/feed — recent reviews from all users (home feed)
router.get('/feed', async (req, res) => {
  try {
    const { page = 1, limit = 15 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [reviews, total] = await Promise.all([
      Review.find()
        .populate('userId', 'username avatar steamId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Review.countDocuments(),
    ]);

    const enriched = reviews.map((r) => ({ ...r, likeCount: r.likes?.length || 0 }));
    res.json({ reviews: enriched, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

// GET /api/reviews/:id — single review
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('userId', 'username avatar steamId bio')
      .lean();
    if (!review) return res.status(404).json({ error: 'Review not found' });
    res.json({ ...review, likeCount: review.likes?.length || 0 });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch review' });
  }
});

// POST /api/reviews — create a review (auth required)
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { appId, gameName, gameHeaderImage, title, body, rating, containsSpoilers, playedOn, hoursAtReview } = req.body;

    if (!appId || !gameName || !body || !rating) {
      return res.status(400).json({ error: 'appId, gameName, body, and rating are required' });
    }

    if (rating < 0.5 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 0.5 and 5' });
    }

    // Check duplicate
    const existing = await Review.findOne({ userId: req.user._id, appId });
    if (existing) {
      return res.status(409).json({ error: 'You already reviewed this game. Edit your existing review.' });
    }

    const review = await Review.create({
      userId: req.user._id,
      steamId: req.user.steamId,
      appId: String(appId),
      gameName,
      gameHeaderImage: gameHeaderImage || `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`,
      title: title || '',
      body,
      rating,
      containsSpoilers: containsSpoilers || false,
      playedOn: playedOn || 'PC',
      hoursAtReview: hoursAtReview || 0,
      likes: [],
    });

    await review.populate('userId', 'username avatar steamId');
    res.status(201).json(review);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'You already reviewed this game.' });
    }
    console.error(err);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// PUT /api/reviews/:id — update review (owner only)
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    if (!review.userId.equals(req.user._id)) {
      return res.status(403).json({ error: 'Not your review' });
    }

    const { title, body, rating, containsSpoilers, playedOn, hoursAtReview } = req.body;

    if (body !== undefined) review.body = body;
    if (title !== undefined) review.title = title;
    if (rating !== undefined) {
      if (rating < 0.5 || rating > 5) return res.status(400).json({ error: 'Rating must be 0.5–5' });
      review.rating = rating;
    }
    if (containsSpoilers !== undefined) review.containsSpoilers = containsSpoilers;
    if (playedOn !== undefined) review.playedOn = playedOn;
    if (hoursAtReview !== undefined) review.hoursAtReview = hoursAtReview;

    await review.save();
    await review.populate('userId', 'username avatar steamId');
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// DELETE /api/reviews/:id — delete review (owner only)
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    if (!review.userId.equals(req.user._id)) {
      return res.status(403).json({ error: 'Not your review' });
    }

    await review.deleteOne();
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// POST /api/reviews/:id/like — toggle like
router.post('/:id/like', isAuthenticated, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    const userId = req.user._id;
    const alreadyLiked = review.likes.some((id) => id.equals(userId));

    if (alreadyLiked) {
      review.likes = review.likes.filter((id) => !id.equals(userId));
    } else {
      review.likes.push(userId);
    }

    await review.save();
    res.json({ liked: !alreadyLiked, likeCount: review.likes.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

module.exports = router;
