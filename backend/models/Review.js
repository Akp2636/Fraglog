const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId         : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  steamId        : { type: String, required: true },
  appId          : { type: String, required: true },
  gameName       : { type: String, required: true },
  gameHeaderImage: { type: String, default: '' },
  title          : { type: String, default: '' },
  body           : { type: String, required: true, maxlength: 5000 },
  rating         : { type: Number, min: 0.5, max: 5, default: null },
  containsSpoilers: { type: Boolean, default: false },
  playedOn       : { type: String, enum: ['PC','Steam Deck','Remote Play','Other'], default: 'PC' },
  hoursAtReview  : { type: Number, default: 0 },
  likes          : [{ type: String }], // steamIds
}, { timestamps: true });

reviewSchema.index({ userId: 1, appId: 1 }, { unique: true });
reviewSchema.index({ appId: 1 });

module.exports = mongoose.model('Review', reviewSchema);
