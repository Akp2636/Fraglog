const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    steamId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    profileUrl: {
      type: String,
      default: '',
    },
    realName: {
      type: String,
      default: '',
    },
    countryCode: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      maxlength: 300,
      default: '',
    },
    favoriteGames: [
      {
        appId: String,
        name: String,
        headerImage: String,
      },
    ],
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    // Cached library stats
    totalGamesOwned: {
      type: Number,
      default: 0,
    },
    totalPlaytimeMinutes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: review count
userSchema.virtual('reviewCount', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'userId',
  count: true,
});

// Virtual: log count
userSchema.virtual('logCount', {
  ref: 'GameLog',
  localField: '_id',
  foreignField: 'userId',
  count: true,
});

module.exports = mongoose.model('User', userSchema);
