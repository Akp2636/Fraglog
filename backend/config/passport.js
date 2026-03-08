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

passport.use(
  new SteamStrategy(
    {
      returnURL: `${process.env.BACKEND_URL}/api/auth/steam/callback`,
      realm: process.env.BACKEND_URL,
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
          // Update existing user info from Steam
          Object.assign(user, userData);
          await user.save();
        } else {
          // Create new user
          user = await User.create(userData);
          console.log(`✅ New user registered: ${user.username} (${steamId})`);
        }

        return done(null, user);
      } catch (err) {
        console.error('❌ Steam auth error:', err);
        return done(err, null);
      }
    }
  )
);
