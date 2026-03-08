const express  = require('express');
const passport = require('passport');
const router   = express.Router();

const BACKEND  = (process.env.BACKEND_URL  || 'http://localhost:5000').replace(/\/$/, '');
const FRONTEND = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

// Debug route
router.get('/debug', (req, res) => {
  res.json({
    BACKEND_URL   : process.env.BACKEND_URL   || 'NOT SET',
    FRONTEND_URL  : process.env.FRONTEND_URL  || 'NOT SET',
    STEAM_API_KEY : process.env.STEAM_API_KEY ? '✅ set' : '❌ MISSING',
    SESSION_SECRET: process.env.SESSION_SECRET ? '✅ set' : '❌ MISSING',
    MONGO_URI     : process.env.MONGO_URI     ? '✅ set' : '❌ MISSING',
    realm         : BACKEND + '/',
    returnURL     : BACKEND + '/api/auth/steam/callback',
  });
});

router.get('/steam', passport.authenticate('steam', { failureRedirect: '/' }));

router.get('/steam/callback',
  passport.authenticate('steam', { failureRedirect: FRONTEND + '/?error=auth_failed' }),
  (req, res) => {
    res.redirect(FRONTEND + '/profile/' + req.user.steamId);
  }
);

router.get('/me', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ user: null, authenticated: false });
  }
  res.json({
    authenticated: true,
    user: {
      _id         : req.user._id,
      steamId     : req.user.steamId,
      username    : req.user.username,
      avatar      : req.user.avatar,
      profileUrl  : req.user.profileUrl,
      bio         : req.user.bio,
      favoriteGames: req.user.favoriteGames,
    },
  });
});

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