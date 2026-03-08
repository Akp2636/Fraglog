const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'You must be logged in to do that.' });
};

const isOwner = (paramKey = 'steamId') => {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }
    if (req.user.steamId !== req.params[paramKey]) {
      return res.status(403).json({ error: 'You can only modify your own data.' });
    }
    next();
  };
};

module.exports = { isAuthenticated, isOwner };
