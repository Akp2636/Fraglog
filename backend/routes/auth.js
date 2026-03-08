const express = require('express');
const axios   = require('axios');
const router  = express.Router();
const User    = require('../models/User');

const BACKEND  = (process.env.BACKEND_URL  || 'http://localhost:5000').replace(/\/$/, '');
const FRONTEND = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
const STEAM_KEY = process.env.STEAM_API_KEY;

const STEAM_OPENID = 'https://steamcommunity.com/openid/login';
const RETURN_URL   = `${BACKEND}/api/auth/steam/callback`;

// ── Debug ─────────────────────────────────────────────────────────────────────
router.get('/debug', (req, res) => {
  res.json({
    BACKEND_URL   : process.env.BACKEND_URL   || 'NOT SET',
    FRONTEND_URL  : process.env.FRONTEND_URL  || 'NOT SET',
    NODE_ENV      : process.env.NODE_ENV      || 'NOT SET',
    STEAM_API_KEY : STEAM_KEY ? '✅ set' : '❌ MISSING',
    SESSION_SECRET: process.env.SESSION_SECRET ? '✅ set' : '❌ MISSING',
    MONGO_URI     : process.env.MONGO_URI     ? '✅ set' : '❌ MISSING',
    returnURL     : RETURN_URL,
    realm         : BACKEND + '/',
  });
});

// ── Step 1: Redirect to Steam OpenID ─────────────────────────────────────────
router.get('/steam', (req, res) => {
  const params = new URLSearchParams({
    'openid.ns'         : 'http://specs.openid.net/auth/2.0',
    'openid.mode'       : 'checkid_setup',
    'openid.return_to'  : RETURN_URL,
    'openid.realm'      : BACKEND + '/',
    'openid.identity'   : 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id' : 'http://specs.openid.net/auth/2.0/identifier_select',
  });

  res.redirect(`${STEAM_OPENID}?${params.toString()}`);
});

// ── Step 2: Steam callback — verify + fetch profile ──────────────────────────
router.get('/steam/callback', async (req, res) => {
  try {
    const query = req.query;

    // Must be positive assertion
    if (query['openid.mode'] !== 'id_res') {
      console.error('❌ OpenID mode is not id_res:', query['openid.mode']);
      return res.redirect(`${FRONTEND}/?error=auth_cancelled`);
    }

    // Verify with Steam
    const verifyParams = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => verifyParams.append(k, v));
    verifyParams.set('openid.mode', 'check_authentication');

    const verifyRes = await axios.post(STEAM_OPENID, verifyParams.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    if (!verifyRes.data.includes('is_valid:true')) {
      console.error('❌ Steam OpenID verification failed');
      return res.redirect(`${FRONTEND}/?error=verify_failed`);
    }

    // Extract Steam ID
    const claimedId = query['openid.claimed_id'] || '';
    const steamId   = claimedId.replace('https://steamcommunity.com/openid/id/', '');

    if (!steamId || !/^\d+$/.test(steamId)) {
      console.error('❌ Invalid Steam ID:', claimedId);
      return res.redirect(`${FRONTEND}/?error=invalid_id`);
    }

    console.log('✅ Steam ID verified:', steamId);

    // Fetch player profile from Steam API
    const profileRes = await axios.get(
      'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/',
      { params: { key: STEAM_KEY, steamids: steamId } }
    );

    const player = profileRes.data?.response?.players?.[0];

    if (!player) {
      console.error('❌ No Steam player found for:', steamId);
      return res.redirect(`${FRONTEND}/?error=no_profile`);
    }

    // Find or create user in MongoDB
    let user = await User.findOne({ steamId });

    const userData = {
      steamId,
      username    : player.personaname       || 'Unknown',
      avatar      : player.avatarfull        || player.avatar || '',
      profileUrl  : player.profileurl        || '',
      realName    : player.realname          || '',
      countryCode : player.loccountrycode    || '',
      lastLogin   : new Date(),
    };

    if (user) {
      Object.assign(user, userData);
      await user.save();
      console.log(`✅ Returning user: ${user.username}`);
    } else {
      user = await User.create(userData);
      console.log(`✅ New user: ${user.username} (${steamId})`);
    }

    // Encode user → send to frontend in URL
    const encoded = Buffer.from(JSON.stringify({
      _id          : user._id,
      steamId      : user.steamId,
      username     : user.username,
      avatar       : user.avatar,
      profileUrl   : user.profileUrl,
      bio          : user.bio           || '',
      favoriteGames: user.favoriteGames || [],
    })).toString('base64');

    return res.redirect(`${FRONTEND}/auth/callback?data=${encoded}`);

  } catch (err) {
    console.error('❌ Auth callback error:', err.message);
    return res.redirect(`${FRONTEND}/?error=server_error`);
  }
});

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
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => {
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out' });
    });
  });
});

module.exports = router;