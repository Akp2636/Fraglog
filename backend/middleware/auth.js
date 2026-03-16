const jwt = require('jsonwebtoken')

const SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'fraglog_dev_secret'

// Pass PLAIN OBJECT with explicit fields — never a Mongoose document
const signToken = ({ _id, steamId, username, avatar }) => {
  return jwt.sign({ _id: String(_id), steamId, username, avatar }, SECRET, { expiresIn: '30d' })
}

const requireAuth = (req, res, next) => {
  try {
    const header = req.headers['authorization']
    if (header?.startsWith('Bearer ')) {
      const decoded = jwt.verify(header.slice(7), SECRET)
      // Ensure _id and steamId are always strings
      req.user = {
        _id     : String(decoded._id),
        steamId : String(decoded.steamId),
        username: decoded.username,
        avatar  : decoded.avatar,
      }
      console.log(`✅ Auth OK: ${req.user.username} (${req.user.steamId})`)
      return next()
    }
    if (req.session?.user) {
      req.user = req.session.user
      return next()
    }
    return res.status(401).json({ error: 'Not authenticated' })
  } catch (err) {
    console.error('❌ Auth error:', err.message)
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

module.exports = { signToken, requireAuth }
