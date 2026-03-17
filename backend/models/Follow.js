const mongoose = require('mongoose')

const followSchema = new mongoose.Schema({
  followerId  : { type: String, required: true }, // steamId
  followingId : { type: String, required: true }, // steamId
}, { timestamps: true })

followSchema.index({ followerId: 1, followingId: 1 }, { unique: true })
followSchema.index({ followerId: 1 })
followSchema.index({ followingId: 1 })

module.exports = mongoose.model('Follow', followSchema)
