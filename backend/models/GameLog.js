const mongoose = require('mongoose');

const gameLogSchema = new mongoose.Schema({
  userId     : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  steamId    : { type: String, required: true },
  appId      : { type: String, required: true },
  gameName   : { type: String, required: true },
  headerImage: { type: String, default: '' },
  status     : {
    type   : String,
    enum   : ['playing','played','want_to_play','dropped','on_hold','completed'],
    default: 'want_to_play',
  },
  rating     : { type: Number, min: 0.5, max: 5, default: null },
  hoursLogged: { type: Number, default: 0 },
  notes      : { type: String, default: '', maxlength: 1000 },
  startDate  : { type: Date, default: null },
  finishDate : { type: Date, default: null },
}, { timestamps: true });

gameLogSchema.index({ userId: 1, appId: 1 }, { unique: true });

module.exports = mongoose.model('GameLog', gameLogSchema);
