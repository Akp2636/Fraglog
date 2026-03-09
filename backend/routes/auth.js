const express = require('express');
const axios   = require('axios');
const router  = express.Router();
const User    = require('../models/User');

const BACKEND    = (process.env.BACKEND_URL  || 'http://localhost:5000').replace(/\/$/, '');
const FRONTEND   = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
const STEAM_KEY  = process.env.STEAM_API_KEY;
const OPENID_URL = 'https://steamcommunity.com/openid/login';
const RETURN_URL = `${BACKEND}/api/auth/steam/callback`;

// ── Debug ─────────────────────────────────────────────────────────────────────
router.get('/debug', (req, res) => {
  res.json({
    BACKEND_URL   : process.env.BACKEND_URL    || 'NOT SET',
    FRONTEND_URL  : process.env.FRONTEND_URL   || 'NOT SET',
    NODE_ENV      : process.env.NODE_ENV       || 'NOT SET',
    STEAM_API_KEY : STEAM_KEY  ? '✅ set' : '❌ MISSING',
    SESSION_SECRET: process.env.SESSION_SECRET ? '✅ set' : '❌ MISSING',
    MONGO_URI     : process.env.MONGO_URI      ? '✅ set' : '❌ MISSING',
    returnURL     : RETURN_URL,
    realm         : BACKEND + '/',
  });
});

// ── Step 1: Redirect → Steam OpenID ──────────────────────────────────────────
router.get('/steam', (req, res) => {
  const params = new URLSearchParams({
    'openid.ns'        : 'http://specs.openid.net/auth/2.0',
    'openid.mode'      : 'checkid_setup',
    'openid.return_to' : RETURN_URL,
    'openid.realm'     : BACKEND + '/',
    'openid.identity'  : 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
  });
  res.redirect(`${OPENID_URL}?${params.toString()}`);
});

// ── Step 2: Steam callback ─────────────────────────────────────────────────
router.get('/steam/callback', async (req, res) => {
  try {
    const q = req.query;

    // Must be positive assertion
    if (q['openid.mode'] !== 'id_res') {
      console.log('OpenID mode not id_res:', q['openid.mode']);
      return res.redirect(`${FRONTEND}/?error=auth_cancelled`);
    }

    // ── Verify with Steam (stateless check_authentication) ───────────────────
    const verifyParams = new URLSearchParams(q);
    verifyParams.set('openid.mode', 'check_authentication');

    let verifyData;
    try {
      const vRes = await axios.post(OPENID_URL, verifyParams.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 15000,
      });
      verifyData = vRes.data;
    } catch (e) {
      console.error('❌ Steam verify network error:', e.message);
      return res.redirect(`${FRONTEND}/?error=verify_network`);
    }

    if (!verifyData.includes('is_valid:true')) {
      console.error('❌ Steam says not valid:', verifyData);
      return res.redirect(`${FRONTEND}/?error=verify_failed`);
    }

    // ── Extract Steam ID ──────────────────────────────────────────────────────
    const claimedId = q['openid.claimed_id'] || '';
    const steamId   = claimedId.replace('https://steamcommunity.com/openid/id/', '');

    if (!steamId || !/^\d+$/.test(steamId)) {
      console.error('❌ Bad Steam ID from:', claimedId);
      return res.redirect(`${FRONTEND}/?error=invalid_id`);
    }
    console.log('✅ Steam ID verified:', steamId);

    // ── Fetch Steam profile from Valve API ────────────────────────────────────
    let player;
    try {
      const pRes = await axios.get(
        'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/',
        { params: { key: STEAM_KEY, steamids: steamId }, timeout: 10000 }
      );
      player = pRes.data?.response?.players?.[0];
    } catch (e) {
      console.error('❌ Steam API error:', e.message);
      return res.redirect(`${FRONTEND}/?error=steam_api_error`);
    }

    if (!player) {
      console.error('❌ No player found for steamId:', steamId);
      return res.redirect(`${FRONTEND}/?error=no_profile`);
    }
    console.log('✅ Got Steam profile:', player.personaname);

    // ── Upsert user in MongoDB ────────────────────────────────────────────────
    let user;
    try {
      user = await User.findOne({ steamId });
      const payload = {
        steamId,
        username    : player.personaname       || 'Unknown',
        avatar      : player.avatarfull        || player.avatar || '',
        profileUrl  : player.profileurl        || '',
        realName    : player.realname          || '',
        countryCode : player.loccountrycode    || '',
        lastLogin   : new Date(),
      };
      if (user) {
        Object.assign(user, payload);
        await user.save();
        console.log('✅ Updated user:', user.username);
      } else {
        user = await User.create(payload);
        console.log('✅ Created user:', user.username);
      }
    } catch (e) {
      console.error('❌ MongoDB error:', e.message);
      return res.redirect(`${FRONTEND}/?error=db_error`);
    }

    // ── Encode user → pass to frontend in URL ─────────────────────────────────
    const token = Buffer.from(JSON.stringify({
      _id          : user._id,
      steamId      : user.steamId,
      username     : user.username,
      avatar       : user.avatar,
      profileUrl   : user.profileUrl,
      bio          : user.bio           || '',
      favoriteGames: user.favoriteGames || [],
    })).toString('base64');

    console.log('✅ Redirecting to frontend /auth/callback');
    return res.redirect(`${FRONTEND}/auth/callback?token=${token}`);

  } catch (err) {
    console.error('❌ Unexpected callback error:', err.message, '\n', err.stack);
    return res.redirect(`${FRONTEND}/?error=server_error`);
  }
});

// ── Get current user (session-based, works on localhost) ──────────────────────
router.get('/me', (req, res) => {
  const cached = req.session?.user;
  if (!cached) return res.status(401).json({ authenticated: false, user: null });
  res.json({ authenticated: true, user: cached });
});

// ── Logout ────────────────────────────────────────────────────────────────────
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

module.exports = router;
