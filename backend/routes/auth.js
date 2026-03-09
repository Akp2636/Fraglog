const express = require('express');
const passport = require('passport');
const router = express.Router();

const FRONTEND = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
const BACKEND  = (process.env.BACKEND_URL  || 'http://localhost:5000').replace(/\/$/, '');


// ── Debug Route ───────────────────────────────────────────────────────────────
router.get('/debug', (req, res) => {
  res.json({
    BACKEND_URL: process.env.BACKEND_URL || 'NOT SET',
    FRONTEND_URL: process.env.FRONTEND_URL || 'NOT SET',
    NODE_ENV: process.env.NODE_ENV || 'NOT SET',
    STEAM_API_KEY: process.env.STEAM_API_KEY ? '✅ set' : '❌ MISSING',
    SESSION_SECRET: process.env.SESSION_SECRET ? '✅ set' : '❌ MISSING',
    MONGO_URI: process.env.MONGO_URI ? '✅ set' : '❌ MISSING',
    returnURL: `${BACKEND}/api/auth/steam/return`,
    realm: `${BACKEND}/`
  });
});


// ── Step 1: Start Steam Login ─────────────────────────────────────────────────
router.get('/steam',
  passport.authenticate('steam', { failureRedirect: '/' })
);


// ── Step 2: Steam Callback ────────────────────────────────────────────────────
router.get(
  '/steam/return',
  passport.authenticate('steam', {
    failureRedirect: `${FRONTEND}/?error=auth_failed`,
    session: true
  }),
  (req, res) => {

    if (!req.user) {
      console.warn("Steam login returned no user");
      return res.redirect(`${FRONTEND}/?error=no_user`);
    }

    console.log(`✅ Steam user authenticated: ${req.user.username}`);

    const encoded = Buffer.from(
      JSON.stringify({
        _id: req.user._id,
        steamId: req.user.steamId,
        username: req.user.username,
        avatar: req.user.avatar,
        profileUrl: req.user.profileUrl || "",
        bio: req.user.bio || "",
        favoriteGames: req.user.favoriteGames || []
      })
    ).toString('base64');


    res.redirect(`${FRONTEND}/auth/callback?data=${encoded}`);
  }
);


// ── Get Logged In User ────────────────────────────────────────────────────────
router.get('/me', (req, res) => {

  if (!req.isAuthenticated()) {
    return res.status(401).json({
      authenticated: false,
      user: null
    });
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
      favoriteGames: req.user.favoriteGames
    }
  });

});


// ── Logout ────────────────────────────────────────────────────────────────────
router.get('/logout', (req, res, next) => {

  const steamId = req.user ? req.user.steamId : "unknown";

  req.logout(function(err) {

    if (err) {
      console.error("Logout error:", err);
      return next(err);
    }

    req.session.destroy(() => {

      res.clearCookie('connect.sid');

      console.log(`User logged out: ${steamId}`);

      res.json({
        success: true,
        message: "Logged out"
      });

    });

  });

});


module.exports = router;