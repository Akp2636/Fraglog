const express  = require('express');
const passport = require('passport');
const router   = express.Router();

const BACKEND  = (process.env.BACKEND_URL  || 'http://localhost:5000').replace(/\/$/, '');
const FRONTEND = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

// ── DEBUG — visit http://localhost:5000/api/auth/debug to check config
router.get('/debug', (req, res) => {
  res.json({
    BACKEND_URL    : process.env.BACKEND_URL,
    FRONTEND_URL   : process.env.FRONTEND_URL,
    STEAM_API_KEY  : process.env.STEAM_API_KEY ? '✅ set (' + process.env.STEAM_API_KEY.slice(0,6) + '...)' : '❌ MISSING',
    SESSION_SECRET : process.env.SESSION_SECRET ? '✅ set' : '❌ MISSING',
    realm          : `${BACKEND}/`,
    returnURL      : `${BACKEND}/api/auth/steam/callback`,
  });
});

// ── Steam login redirect
router.get('/steam', passport.authenticate('steam', { failureRedirect: '/' }));

// ── Steam callback
router.get(
  '/steam/callback',
  passport.authenticate('steam', {
    failureRedirect: `${FRONTEND}/?error=auth_failed`,
  }),
  (req, res) => {
    res.redirect(`${FRONTEND}/profile/${req.user.steamId}`);
  }
);

// ── Get current user
router.get('/me', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ user: null, authenticated: false });
  }
  res.json({
    authenticated: true,
    user: {
      _id       : req.user._id,
      steamId   : req.user.steamId,
      username  : req.user.username,
      avatar    : req.user.avatar,
      profileUrl: req.user.profileUrl,
      bio       : req.user.bio,
      favoriteGames: req.user.favoriteGames,
    },
  });
});

// ── Logout
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
```

---

## After saving — do this checklist

**1. Visit the debug route first:**
```
http://localhost:5000/api/auth/debug