const mongoose = require('mongoose')

const gameListSchema = new mongoose.Schema({
  steamId    : { type: String, required: true },
  username   : { type: String, required: true },
  avatar     : { type: String, default: '' },
  title      : { type: String, required: true, maxlength: 120 },
  description: { type: String, default: '', maxlength: 1000 },
  games      : [{
    appId      : { type: String, required: true },
    name       : { type: String, required: true },
    headerImage: { type: String, default: '' },
    position   : { type: Number, required: true },
  }],
  likes      : [{ type: String }], // steamIds
  isPublic   : { type: Boolean, default: true },
}, { timestamps: true })

gameListSchema.index({ steamId: 1 })
gameListSchema.index({ createdAt: -1 })

module.exports = mongoose.model('GameList', gameListSchema)
