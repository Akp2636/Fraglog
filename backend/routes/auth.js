const express  = require('express');
const passport = require('passport');
const router   = express.Router();

const BACKEND  = (process.env.BACKEND_URL  || 'http://localhost:5000').replace(/\/$/, '');
const FRONTEND = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

// ── Debug route — visit /api/auth/debug to verify config ─────────────────────
router.get('/debug', (req, res) => {
  res.json({
    BACKEND_URL   : process.env.BACKEND_URL   || 'NOT SET',
    FRONTEND_URL  : process.env.FRONTEND_URL  || 'NOT SET',
    NODE_ENV      : process.env.NODE_ENV      || 'NOT SET',
    STEAM_API_KEY : process.env.STEAM_API_KEY ? '✅ set (' + process.env.STEAM_API_KEY.slice(0, 6) + '...)' : ' MISSING',
    SESSION_SECRET: process.env.SESSION_SECRET ? '✅ set' : ' MISSING',
    MONGO_URI     : process.env.MONGO_URI     ? '✅ set' : ' MISSING',
    realm         : BACKEND + '/',
    returnURL     : BACKEND + '/api/auth/steam/callback',
  });
});

// ── Steam login redirect ──────────────────────────────────────────────────────
router.get('/steam', passport.authenticate('steam', { failureRedirect: '/' }));

// ── Steam callback ────────────────────────────────────────────────────────────
router.get('/steam/callback',
  (req, res, next) => {
    passport.authenticate('steam', (err, user, info) => {
      if (err) {
        console.error(' Auth error:', err.message);
        return res.redirect(FRONTEND + '/?error=auth_error');
      }
      if (!user) {
        console.error(' No user returned from Steam');
        return res.redirect(FRONTEND + '/?error=no_user');
      }
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error(' Login error:', loginErr.message);
          return res.redirect(FRONTEND + '/?error=login_error');
        }
        console.log(`✅ User logged in: ${user.username}`);
        return res.redirect(FRONTEND + '/profile/' + user.steamId);
      });
    })(req, res, next);
  }
);

// ── Get current logged-in user ────────────────────────────────────────────────
router.get('/me', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ user: null, authenticated: false });
  }
  res.json({
    authenticated: true,
    user: {
      _id          : req.user._id,
      steamId      : req.user.steamId,
      username     : req.user.username,
      avatar       : req.user.avatar,
      profileUrl   : req.user.profileUrl,
      bio          : req.user.bio,
      favoriteGames: req.user.favoriteGames,
    },
  });
});

// ── Logout ────────────────────────────────────────────────────────────────────
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
