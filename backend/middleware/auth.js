// Uses Node built-in crypto — NO new npm packages needed
const crypto = require('crypto')

const SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'fraglog_dev_secret_change_me'

// ── Sign token (base64url data + HMAC signature) ──────────────────────────────
const signToken = (payload) => {
  const data = Buffer.from(JSON.stringify({ ...payload, iat: Date.now() })).toString('base64url')
  const sig  = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
  return `${data}.${sig}`
}

// ── Verify token ──────────────────────────────────────────────────────────────
const verifyToken = (token) => {
  const [data, sig] = (token || '').split('.')
  if (!data || !sig) throw new Error('Malformed token')
  const expected = crypto.createHmac('sha256', SECRET).update(data).digest('base64url')
  if (sig !== expected) throw new Error('Invalid signature')
  return JSON.parse(Buffer.from(data, 'base64url').toString())
}

// ── Middleware ─────────────────────────────────────────────────────────────────
const requireAuth = (req, res, next) => {
  try {
    // 1. Authorization: Bearer <token>  — works cross-domain (Vercel → Render)
    const header = req.headers['authorization']
    if (header?.startsWith('Bearer ')) {
      req.user = verifyToken(header.slice(7))
      return next()
    }
    // 2. Session fallback — works on localhost
    if (req.session?.user) {
      req.user = req.session.user
      return next()
    }
    return res.status(401).json({ error: 'Not authenticated' })
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

module.exports = { signToken, verifyToken, requireAuth }
