const express  = require('express')
const axios    = require('axios')
const router   = express.Router()
const User     = require('../models/User')
const { signToken } = require('../middleware/auth')

const BACKEND   = (process.env.BACKEND_URL  || 'http://localhost:5000').replace(/\/$/, '')
const FRONTEND  = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '')
const STEAM_KEY = process.env.STEAM_API_KEY
const OPENID    = 'https://steamcommunity.com/openid/login'
const RETURN_TO = `${BACKEND}/api/auth/steam/callback`

// Debug
router.get('/debug', (req, res) => res.json({
  BACKEND_URL  : process.env.BACKEND_URL    || 'NOT SET',
  FRONTEND_URL : process.env.FRONTEND_URL   || 'NOT SET',
  NODE_ENV     : process.env.NODE_ENV       || 'NOT SET',
  STEAM_API_KEY: STEAM_KEY ? '✅ set' : '❌ MISSING',
  JWT_SECRET   : process.env.JWT_SECRET     ? '✅ set' : '⚠️ using SESSION_SECRET fallback',
  MONGO_URI    : process.env.MONGO_URI      ? '✅ set' : '❌ MISSING',
  returnURL    : RETURN_TO,
}))

// Step 1 — redirect to Steam
router.get('/steam', (req, res) => {
  const params = new URLSearchParams({
    'openid.ns'        : 'http://specs.openid.net/auth/2.0',
    'openid.mode'      : 'checkid_setup',
    'openid.return_to' : RETURN_TO,
    'openid.realm'     : BACKEND + '/',
    'openid.identity'  : 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
  })
  res.redirect(`${OPENID}?${params}`)
})

// Step 2 — Steam callback
router.get('/steam/callback', async (req, res) => {
  try {
    const q = req.query
    if (q['openid.mode'] !== 'id_res')
      return res.redirect(`${FRONTEND}/?error=auth_cancelled`)

    // Verify with Steam
    const verifyParams = new URLSearchParams(q)
    verifyParams.set('openid.mode', 'check_authentication')
    let verifyData
    try {
      const r = await axios.post(OPENID, verifyParams.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 15000,
      })
      verifyData = r.data
    } catch (e) {
      console.error('❌ Steam verify failed:', e.message)
      return res.redirect(`${FRONTEND}/?error=verify_network`)
    }

    if (!verifyData.includes('is_valid:true'))
      return res.redirect(`${FRONTEND}/?error=verify_failed`)

    // Extract Steam ID
    const steamId = (q['openid.claimed_id'] || '').replace('https://steamcommunity.com/openid/id/', '')
    if (!steamId || !/^\d+$/.test(steamId))
      return res.redirect(`${FRONTEND}/?error=invalid_id`)

    console.log('✅ Steam ID:', steamId)

    // Fetch Steam profile
    let player
    try {
      const r = await axios.get('https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/', {
        params: { key: STEAM_KEY, steamids: steamId }, timeout: 10000,
      })
      player = r.data?.response?.players?.[0]
    } catch (e) {
      console.error('❌ Steam API:', e.message)
      return res.redirect(`${FRONTEND}/?error=steam_api_error`)
    }

    if (!player) return res.redirect(`${FRONTEND}/?error=no_profile`)
    console.log('✅ Profile:', player.personaname)

    // Upsert user in MongoDB
    let user
    try {
      const payload = {
        steamId,
        username   : player.personaname    || 'Unknown',
        avatar     : player.avatarfull     || player.avatar || '',
        profileUrl : player.profileurl     || '',
        realName   : player.realname       || '',
        countryCode: player.loccountrycode || '',
        lastLogin  : new Date(),
      }
      user = await User.findOneAndUpdate(
        { steamId },
        payload,
        { upsert: true, new: true }
      )
      console.log('✅ User saved:', user.username)
    } catch (e) {
      console.error('❌ DB error:', e.message)
      return res.redirect(`${FRONTEND}/?error=db_error`)
    }

    // ── Sign a JWT ────────────────────────────────────────────────────────────

    // ── Also set session (for localhost fallback) ─────────────────────────────
    req.session.user = {
      _id     : user._id,
      steamId : user.steamId,
      username: user.username,
      avatar  : user.avatar,
      bio     : user.bio || '',
    }

    // ── Pass BOTH to frontend ─────────────────────────────────────────────────
    const userData = Buffer.from(JSON.stringify({
      _id      : user._id,
      steamId  : user.steamId,
      username : user.username,
      avatar   : user.avatar,
      profileUrl: user.profileUrl,
      bio      : user.bio || '',
    })).toString('base64')

    console.log('✅ Redirecting to frontend')
    return res.redirect(`${FRONTEND}`)
  } catch (err) {
    console.error('❌ Callback error:', err.message)
    return res.redirect(`${FRONTEND}/?error=server_error`)
  }
})

// Get current user (session fallback for localhost)
router.get('/me', (req, res) => {
  const u = req.session?.user
  if (!u) return res.status(401).json({ authenticated: false, user: null })
  res.json({ authenticated: true, user: u })
})

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => res.clearCookie('connect.sid'))
  res.json({ message: 'Logged out' })
})
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.clearCookie('connect.sid'))
  res.json({ message: 'Logged out' })
})

module.exports = router
