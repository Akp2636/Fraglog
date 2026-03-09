const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  steamId      : { type: String, required: true, unique: true },
  username     : { type: String, required: true },
  avatar       : { type: String, default: '' },
  profileUrl   : { type: String, default: '' },
  realName     : { type: String, default: '' },
  countryCode  : { type: String, default: '' },
  bio          : { type: String, default: '', maxlength: 500 },
  favoriteGames: [{ appId: String, name: String, headerImage: String }],
  lastLogin    : { type: Date, default: Date.now },
  totalGamesOwned     : { type: Number, default: 0 },
  totalPlaytimeMinutes: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
