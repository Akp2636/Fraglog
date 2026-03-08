const mongoose = require('mongoose');

const gameLogSchema = new mongoose.Schema(
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
    },
    gameName: {
      type: String,
      required: true,
    },
    gameHeaderImage: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['playing', 'played', 'want_to_play', 'dropped', 'on_hold'],
      required: true,
    },
    rating: {
      type: Number,
      min: 0.5,
      max: 5,
      default: null,
    },
    hoursLogged: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      maxlength: 500,
      default: '',
    },
    startDate: {
      type: Date,
      default: null,
    },
    finishDate: {
      type: Date,
      default: null,
    },
    timesCompleted: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// One log entry per user per game
gameLogSchema.index({ userId: 1, appId: 1 }, { unique: true });

module.exports = mongoose.model('GameLog', gameLogSchema);
