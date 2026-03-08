const express = require('express');
const passport = require('passport');
const router = express.Router();

// GET /api/auth/steam — redirect to Steam login
router.get('/steam', passport.authenticate('steam', { failureRedirect: '/' }));

// GET /api/auth/steam/callback — Steam redirects here
router.get(
  '/steam/callback',
  passport.authenticate('steam', {
    failureRedirect: `${process.env.FRONTEND_URL}/?error=auth_failed`,
  }),
  (req, res) => {
    // Success — redirect to frontend
    res.redirect(`${process.env.FRONTEND_URL}/profile/${req.user.steamId}`);
  }
);

// GET /api/auth/me — get current logged-in user
router.get('/me', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ user: null, authenticated: false });
  }
  res.json({
    authenticated: true,
    user: {
      _id: req.user._id,
      steamId: req.user.steamId,
      username: req.user.username,
      avatar: req.user.avatar,
      profileUrl: req.user.profileUrl,
      bio: req.user.bio,
      favoriteGames: req.user.favoriteGames,
    },
  });
});

// GET /api/auth/logout
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  });
});

module.exports = router;
