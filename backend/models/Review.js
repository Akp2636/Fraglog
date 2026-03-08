const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    steamId: {
      type: String,
      required: true,
    },
    appId: {
      type: String,
      required: true,
      index: true,
    },
    gameName: {
      type: String,
      required: true,
    },
    gameHeaderImage: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      trim: true,
      maxlength: 150,
      default: '',
    },
    body: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 5000,
    },
    rating: {
      type: Number,
      min: 0.5,
      max: 5,
      required: true,
    },
    containsSpoilers: {
      type: Boolean,
      default: false,
    },
    playedOn: {
      type: String,
      enum: ['PC', 'Steam Deck', 'Remote Play'],
      default: 'PC',
    },
    hoursAtReview: {
      type: Number,
      default: 0,
      min: 0,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Unique: one review per user per game
reviewSchema.index({ userId: 1, appId: 1 }, { unique: true });

reviewSchema.virtual('likeCount').get(function () {
  return this.likes.length;
});

module.exports = mongoose.model('Review', reviewSchema);
