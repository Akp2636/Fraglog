const passport = require('passport');
const SteamStrategy = require('passport-steam').Strategy;
const axios = require('axios');
const User = require('../models/User');

const BACKEND = (process.env.BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');

passport.use(new SteamStrategy({
    returnURL : `${BACKEND}/api/auth/steam/return`,
    realm     : `${BACKEND}/`,
    apiKey    : process.env.STEAM_API_KEY,
    stateless : true,   // ← THIS IS THE FIX — no nonce stored between requests
  },
  async (identifier, profile, done) => {
    try {
      const steamId = profile.id;
      console.log(`Steam login — SteamID: ${steamId}`);

      let user = await User.findOne({ steamId });

      if (!user) {
        const response = await axios.get(
          'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/',
          { params: { key: process.env.STEAM_API_KEY, steamids: steamId } }
        );
        const playerData = response.data.response.players[0];

        if (!playerData) {
          console.error('No player data for:', steamId);
          return done(null, false);
        }

        user = await User.create({
          steamId,
          username    : playerData.personaname,
          avatar      : playerData.avatarfull,
          profileUrl  : playerData.profileurl    || '',
          realName    : playerData.realname       || '',
          countryCode : playerData.loccountrycode || '',
          lastLogin   : new Date(),
        });
        console.log('✅ New user:', user.username);
      } else {
        user.lastLogin = new Date();
        await user.save();
        console.log('✅ Returning user:', user.username);
      }

      return done(null, user);
    } catch (err) {
      console.error('Steam auth error:', err.message);
      return done(err, null);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});