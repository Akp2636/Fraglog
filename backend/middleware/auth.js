const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'fraglog_dev_secret'

const signToken = (user) => jwt.sign(
  { _id: user._id, steamId: user.steamId, username: user.username, avatar: user.avatar },
  JWT_SECRET,
  { expiresIn: '30d' }
)

const requireAuth = (req, res, next) => {
  try {
    // Try Authorization: Bearer <token>  (cross-domain production)
    const header = req.headers['authorization']
    if (header?.startsWith('Bearer ')) {
      req.user = jwt.verify(header.slice(7), JWT_SECRET)
      return next()
    }
    // Fallback: session (localhost dev)
    if (req.session?.user) {
      req.user = req.session.user
      return next()
    }
    return res.status(401).json({ error: 'Not authenticated' })
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

module.exports = { signToken, requireAuth }
