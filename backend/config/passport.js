const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => done(null, user._id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-__v');
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// ─── Build these explicitly — no trailing slash on BACKEND_URL ───────────────
const BACKEND  = (process.env.BACKEND_URL  || 'http://localhost:5000').replace(/\/$/, '');
const FRONTEND = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

const RETURN_URL = `${BACKEND}/api/auth/steam/callback`;
const REALM      = `${BACKEND}/`;   // ← trailing slash required by Steam

console.log('🔑 Steam OpenID config:');
console.log('   realm     :', REALM);
console.log('   returnURL :', RETURN_URL);

passport.use(
  new SteamStrategy(
    {
      returnURL : RETURN_URL,
      realm     : REALM,
      apiKey    : process.env.STEAM_API_KEY,
    },
    async (identifier, profile, done) => {
      try {
        const steamId = profile.id;
        let user = await User.findOne({ steamId });

        const userData = {
          steamId,
          username    : profile.displayName,
          avatar      : profile.photos?.[2]?.value || profile.photos?.[0]?.value || '',
          profileUrl  : profile._json?.profileurl  || '',
          realName    : profile._json?.realname     || '',
          countryCode : profile._json?.loccountrycode || '',
          lastLogin   : new Date(),
        };

        if (user) {
          Object.assign(user, userData);
          await user.save();
        } else {
          user = await User.create(userData);
          console.log(`✅ New user: ${user.username} (${steamId})`);
        }

        return done(null, user);
      } catch (err) {
        console.error('❌ Steam auth error:', err);
        return done(err, null);
      }
    }
  )
);