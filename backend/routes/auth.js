const express  = require('express');
const passport = require('passport');
const router   = express.Router();

const FRONTEND = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

// ── Debug ─────────────────────────────────────────────────────────────────────
router.get('/debug', (req, res) => {
  const BACKEND = (process.env.BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');
  res.json({
    BACKEND_URL   : process.env.BACKEND_URL   || 'NOT SET',
    FRONTEND_URL  : process.env.FRONTEND_URL  || 'NOT SET',
    NODE_ENV      : process.env.NODE_ENV      || 'NOT SET',
    STEAM_API_KEY : process.env.STEAM_API_KEY ? '✅ set' : '❌ MISSING',
    SESSION_SECRET: process.env.SESSION_SECRET ? '✅ set' : '❌ MISSING',
    MONGO_URI     : process.env.MONGO_URI     ? '✅ set' : '❌ MISSING',
    returnURL     : `${BACKEND}/api/auth/steam/return`,
    realm         : `${BACKEND}/`,
  });
});

// ── Step 1: Start Steam login ─────────────────────────────────────────────────
router.get('/steam', (req, res, next) => {
  console.log('Steam login initiated');
  passport.authenticate('steam', { failureRedirect: '/' })(req, res, next);
});

// ── Step 2: Steam returns here ────────────────────────────────────────────────
router.get('/steam/return',
  (req, res, next) => {
    passport.authenticate('steam', {
      failureRedirect: FRONTEND + '/?error=auth_failed',
      failureMessage: true
    }, (err, user) => {
      if (err) {
        console.error(`Steam callback error: ${err.message}`);
        return res.redirect(FRONTEND + '/?error=auth_error');
      }
      if (!user) {
        console.warn('Steam callback: no user returned');
        return res.redirect(FRONTEND + '/?error=no_user');
      }

      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error(`Session login error: ${loginErr.message}`);
          return res.redirect(FRONTEND + '/?error=login_error');
        }

        console.log(`✅ User authenticated: ${user.username} (${user.steamId})`);

        // Encode user data → pass to frontend via URL
        const encoded = Buffer.from(JSON.stringify({
          _id          : user._id,
          steamId      : user.steamId,
          username     : user.username,
          avatar       : user.avatar,
          profileUrl   : user.profileUrl   || '',
          bio          : user.bio          || '',
          favoriteGames: user.favoriteGames || [],
        })).toString('base64');

        return res.redirect(`${FRONTEND}/auth/callback?data=${encoded}`);
      });
    })(req, res, next);
  }
);

// ── Get current session user ──────────────────────────────────────────────────
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
  const steamId = req.user ? req.user.steamId : 'unknown';
  req.logout((err) => {
    if (err) {
      console.error(`Logout error for ${steamId}: ${err.message}`);
      return next(err);
    }
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      console.log(`User logged out: ${steamId}`);
      res.json({ message: 'Logged out' });
    });
  });
});

module.exports = router;