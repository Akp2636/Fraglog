const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-__v');
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// ⚠️  Make sure BACKEND_URL in your .env has NO trailing slash
// e.g.  BACKEND_URL=http://localhost:5000
passport.use(
  new SteamStrategy(
    {
      returnURL: `${process.env.BACKEND_URL}/api/auth/steam/callback`,
      realm: `${process.env.BACKEND_URL}/`,   // <-- trailing slash is required by Steam
      apiKey: process.env.STEAM_API_KEY,
    },
    async (identifier, profile, done) => {
      try {
        const steamId = profile.id;
        let user = await User.findOne({ steamId });

        const userData = {
          steamId,
          username: profile.displayName,
          avatar: profile.photos?.[2]?.value || profile.photos?.[0]?.value || '',
          profileUrl: profile._json?.profileurl || '',
          realName: profile._json?.realname || '',
          countryCode: profile._json?.loccountrycode || '',
          lastLogin: new Date(),
        };

        if (user) {
          Object.assign(user, userData);
          await user.save();
        } else {
          user = await User.create(userData);
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);