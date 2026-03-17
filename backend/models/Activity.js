const mongoose = require('mongoose')

const activitySchema = new mongoose.Schema({
  steamId    : { type: String, required: true },
  username   : { type: String, required: true },
  avatar     : { type: String, default: '' },
  type       : {
    type: String,
    enum: ['LOG_GAME','REVIEW','CREATE_LIST','FOLLOW','UPDATE_LOG'],
    required: true,
  },
  // Flexible payload stored as plain object
  data       : { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true })

activitySchema.index({ steamId: 1, createdAt: -1 })
activitySchema.index({ createdAt: -1 })

module.exports = mongoose.model('Activity', activitySchema)
