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

const BACKEND = (process.env.BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');

console.log('🔑 Steam OpenID config:');
console.log('   realm     :', `${BACKEND}/`);
console.log('   returnURL :', `${BACKEND}/api/auth/steam/callback`);

passport.use(
  new SteamStrategy(
    {
      returnURL : `${BACKEND}/api/auth/steam/callback`,
      realm     : `${BACKEND}/`,
      apiKey    : process.env.STEAM_API_KEY,
    },
    async (identifier, profile, done) => {
      try {
        const steamId = profile.id;

        if (!steamId) {
          console.error('❌ No steamId in profile');
          return done(new Error('No Steam ID received'), null);
        }

        let user = await User.findOne({ steamId });

        const userData = {
          steamId,
          username    : profile.displayName || 'Unknown',
          avatar      : profile.photos?.[2]?.value || profile.photos?.[0]?.value || '',
          profileUrl  : profile._json?.profileurl     || '',
          realName    : profile._json?.realname        || '',
          countryCode : profile._json?.loccountrycode  || '',
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

        return done(null, user);
      } catch (err) {
        console.error('❌ Steam auth callback error:', err.message);
        return done(err, null);
      }
    }
  )
);