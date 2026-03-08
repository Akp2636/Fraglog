const express  = require('express');
const passport = require('passport');
const router   = express.Router();

const BACKEND  = (process.env.BACKEND_URL  || 'http://localhost:5000').replace(/\/$/, '');
const FRONTEND = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

router.get('/debug', (req, res) => {
  res.json({
    BACKEND_URL   : process.env.BACKEND_URL   || 'NOT SET',
    FRONTEND_URL  : process.env.FRONTEND_URL  || 'NOT SET',
    NODE_ENV      : process.env.NODE_ENV      || 'NOT SET',
    STEAM_API_KEY : process.env.STEAM_API_KEY ? '✅ set' : '❌ MISSING',
    SESSION_SECRET: process.env.SESSION_SECRET ? '✅ set' : '❌ MISSING',
    MONGO_URI     : process.env.MONGO_URI     ? '✅ set' : '❌ MISSING',
    realm         : BACKEND + '/',
    returnURL     : BACKEND + '/api/auth/steam/callback',
  });
});

router.get('/steam', passport.authenticate('steam', { failureRedirect: '/' }));

router.get('/steam/callback',
  (req, res, next) => {
    passport.authenticate('steam', (err, user, info) => {
      if (err) {
        console.error('❌ Auth error:', err.message);
        return res.redirect(FRONTEND + '/?error=auth_error');
      }
      if (!user) {
        console.error('❌ No user returned');
        return res.redirect(FRONTEND + '/?error=no_user');
      }
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error('❌ Login error:', loginErr.message);
          return res.redirect(FRONTEND + '/?error=login_error');
        }

        // ← Encode user data and pass to frontend via URL
        const userData = Buffer.from(JSON.stringify({
          _id      : user._id,
          steamId  : user.steamId,
          username : user.username,
          avatar   : user.avatar,
          profileUrl: user.profileUrl,
          bio      : user.bio || '',
          favoriteGames: user.favoriteGames || [],
        })).toString('base64')

        console.log(`✅ User logged in: ${user.username}`);
        return res.redirect(`${FRONTEND}/auth/callback?data=${userData}`);
      });
    })(req, res, next);
  }
);

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