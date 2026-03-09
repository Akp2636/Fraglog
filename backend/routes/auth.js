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

    if (query['openid.mode'] !== 'id_res') {
      return res.redirect(`${FRONTEND}/?error=auth_cancelled`);
    }

    // Step 1: Verify with Steam
    console.log('🔄 Step 1: Verifying with Steam...');
    const verifyParams = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => verifyParams.append(k, v));
    verifyParams.set('openid.mode', 'check_authentication');

    let verifyRes;
    try {
      verifyRes = await axios.post(STEAM_OPENID, verifyParams.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 10000,
      });
    } catch (verifyErr) {
      console.error('❌ Steam verify POST failed:', verifyErr.message);
      return res.redirect(`${FRONTEND}/?error=verify_network_error`);
    }

    if (!verifyRes.data.includes('is_valid:true')) {
      console.error('❌ Steam said not valid:', verifyRes.data);
      return res.redirect(`${FRONTEND}/?error=verify_failed`);
    }

    // Step 2: Extract Steam ID
    console.log('🔄 Step 2: Extracting Steam ID...');
    const claimedId = query['openid.claimed_id'] || '';
    const steamId   = claimedId.replace('https://steamcommunity.com/openid/id/', '');

    if (!steamId || !/^\d+$/.test(steamId)) {
      console.error('❌ Bad steamId:', claimedId);
      return res.redirect(`${FRONTEND}/?error=invalid_id`);
    }
    console.log('✅ Steam ID:', steamId);

    // Step 3: Fetch Steam profile
    console.log('🔄 Step 3: Fetching Steam profile...');
    let player;
    try {
      const profileRes = await axios.get(
        'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/',
        {
          params : { key: STEAM_KEY, steamids: steamId },
          timeout: 10000,
        }
      );
      player = profileRes.data?.response?.players?.[0];
    } catch (profileErr) {
      console.error('❌ Steam API call failed:', profileErr.message);
      return res.redirect(`${FRONTEND}/?error=steam_api_error`);
    }

    if (!player) {
      console.error('❌ No player in Steam response for:', steamId);
      return res.redirect(`${FRONTEND}/?error=no_profile`);
    }
    console.log('✅ Got Steam profile:', player.personaname);

    // Step 4: Save to MongoDB
    console.log('🔄 Step 4: Saving to MongoDB...');
    let user;
    try {
      user = await User.findOne({ steamId });

      const userData = {
        steamId,
        username    : player.personaname    || 'Unknown',
        avatar      : player.avatarfull     || player.avatar || '',
        profileUrl  : player.profileurl     || '',
        realName    : player.realname       || '',
        countryCode : player.loccountrycode || '',
        lastLogin   : new Date(),
      };

      if (user) {
        Object.assign(user, userData);
        await user.save();
        console.log('✅ Updated user:', user.username);
      } else {
        user = await User.create(userData);
        console.log('✅ Created user:', user.username);
      }
    } catch (dbErr) {
      console.error('❌ MongoDB error:', dbErr.message);
      return res.redirect(`${FRONTEND}/?error=db_error`);
    }

    // Step 5: Encode and redirect
    console.log('🔄 Step 5: Redirecting to frontend...');
    const encoded = Buffer.from(JSON.stringify({
      _id          : user._id,
      steamId      : user.steamId,
      username     : user.username,
      avatar       : user.avatar,
      profileUrl   : user.profileUrl,
      bio          : user.bio           || '',
      favoriteGames: user.favoriteGames || [],
    })).toString('base64');

    console.log('✅ All done! Redirecting to frontend callback');
    return res.redirect(`${FRONTEND}/auth/callback?data=${encoded}`);

  } catch (err) {
    console.error('❌ UNEXPECTED error in callback:', err.message, err.stack);
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