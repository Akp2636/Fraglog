const express  = require('express');
const axios    = require('axios');
const router   = express.Router();
const openid   = require('openid'); // already installed via passport-steam
const User     = require('../models/User');

const BACKEND  = (process.env.BACKEND_URL  || 'http://localhost:5000').replace(/\/$/, '');
const FRONTEND = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
const STEAM_KEY = process.env.STEAM_API_KEY;

// ── Stateless RelyingParty — no session needed between requests ───────────────
const relyingParty = new openid.RelyingParty(
  `${BACKEND}/api/auth/steam/callback`, // returnURL
  `${BACKEND}`,                          // realm
  true,                                  // stateless ← this is the key fix
  false,                                 // strict
  []                                     // extensions
);

// ── Debug ─────────────────────────────────────────────────────────────────────
router.get('/debug', (req, res) => {
  res.json({
    BACKEND_URL   : process.env.BACKEND_URL   || 'NOT SET',
    FRONTEND_URL  : process.env.FRONTEND_URL  || 'NOT SET',
    NODE_ENV      : process.env.NODE_ENV      || 'NOT SET',
    STEAM_API_KEY : STEAM_KEY ? '✅ set' : '❌ MISSING',
    SESSION_SECRET: process.env.SESSION_SECRET ? '✅ set' : '❌ MISSING',
    MONGO_URI     : process.env.MONGO_URI     ? '✅ set' : '❌ MISSING',
    returnURL     : `${BACKEND}/api/auth/steam/callback`,
    realm         : `${BACKEND}/`,
  });
});

// ── Step 1: Redirect user to Steam ───────────────────────────────────────────
router.get('/steam', (req, res) => {
  relyingParty.authenticate(
    'https://steamcommunity.com/openid',
    false,
    (err, authUrl) => {
      if (err || !authUrl) {
        console.error('❌ OpenID authenticate error:', err?.message);
        return res.redirect(`${FRONTEND}/?error=openid_error`);
      }
      res.redirect(authUrl);
    }
  );
});

// ── Step 2: Steam redirects back here ────────────────────────────────────────
router.get('/steam/callback', async (req, res) => {
  relyingParty.verifyAssertion(req, async (err, result) => {
    if (err || !result?.authenticated) {
      console.error('❌ OpenID verify error:', err?.message);
      return res.redirect(`${FRONTEND}/?error=auth_error`);
    }

    // Extract Steam ID from OpenID URL
    const steamId = result.claimedIdentifier
      .replace('https://steamcommunity.com/openid/id/', '');

    if (!steamId || !/^\d+$/.test(steamId)) {
      console.error('❌ Invalid Steam ID:', result.claimedIdentifier);
      return res.redirect(`${FRONTEND}/?error=invalid_id`);
    }

    try {
      // Fetch real Steam profile from Valve API
      const steamRes = await axios.get(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/`,
        { params: { key: STEAM_KEY, steamids: steamId } }
      );

      const player = steamRes.data?.response?.players?.[0];

      if (!player) {
        console.error('❌ No Steam player found for ID:', steamId);
        return res.redirect(`${FRONTEND}/?error=no_profile`);
      }

      // Find or create user in MongoDB
      let user = await User.findOne({ steamId });

      const userData = {
        steamId,
        username    : player.personaname  || 'Unknown',
        avatar      : player.avatarfull   || player.avatar || '',
        profileUrl  : player.profileurl   || '',
        realName    : player.realname     || '',
        countryCode : player.loccountrycode || '',
        lastLogin   : new Date(),
      };

      if (user) {
        Object.assign(user, userData);
        await user.save();
        console.log(`✅ Returning user: ${user.username}`);
      } else {
        user = await User.create(userData);
        console.log(`✅ New user created: ${user.username} (${steamId})`);
      }

      // Encode user data and send to frontend via URL
      const encoded = Buffer.from(JSON.stringify({
        _id          : user._id,
        steamId      : user.steamId,
        username     : user.username,
        avatar       : user.avatar,
        profileUrl   : user.profileUrl,
        bio          : user.bio          || '',
        favoriteGames: user.favoriteGames || [],
      })).toString('base64');

      return res.redirect(`${FRONTEND}/auth/callback?data=${encoded}`);

    } catch (dbErr) {
      console.error('❌ DB/API error:', dbErr.message);
      return res.redirect(`${FRONTEND}/?error=server_error`);
    }
  });
});

// ── Get current session user (used on localhost) ──────────────────────────────
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
      res.json({ message: 'Logged out' });
    });
  });
});

module.exports = router;