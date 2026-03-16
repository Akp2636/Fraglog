const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('✅ MongoDB connected')
    await cleanGameLogs()
  } catch (err) {
    console.error('❌ MongoDB error:', err.message)
    process.exit(1)
  }
}

async function cleanGameLogs() {
  try {
    const col = mongoose.connection.collection('gamelogs')

    // 1. Nuke ALL corrupt docs using raw driver (bypasses Mongoose schema)
    //    A corrupt doc is any where steamId is missing, null, empty, or "undefined"
    const nuked = await col.deleteMany({
      $or: [
        { steamId: { $exists: false } },
        { steamId: null },
        { steamId: '' },
        { steamId: 'undefined' },
        { steamId: 'null' },
      ]
    })
    if (nuked.deletedCount > 0)
      console.log(`🧹 Deleted ${nuked.deletedCount} corrupt gamelogs on startup`)

    // 2. Drop ALL indexes except _id (wipes old unique constraint)
    const indexes = await col.indexes()
    for (const idx of indexes) {
      if (idx.name === '_id_') continue
      try {
        await col.dropIndex(idx.name)
        console.log(`🗑️  Dropped old index: ${idx.name}`)
      } catch (e) {
        console.log(`ℹ️  Skip drop ${idx.name}: ${e.message}`)
      }
    }

    // 3. Recreate as NON-unique (E11000 is now impossible)
    await col.createIndex({ steamId: 1, appId: 1 }, { unique: false })
    console.log('✅ Gamelogs index rebuilt (non-unique)')

    // 4. Remove duplicate docs — keep only latest per steamId+appId pair
    const pipeline = [
      { $group: { _id: { steamId: '$steamId', appId: '$appId' }, ids: { $push: '$_id' }, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]
    const dups = await col.aggregate(pipeline).toArray()
    let dupCount = 0
    for (const dup of dups) {
      // Keep the last one (newest), delete all others
      const toDelete = dup.ids.slice(0, -1)
      await col.deleteMany({ _id: { $in: toDelete } })
      dupCount += toDelete.length
    }
    if (dupCount > 0)
      console.log(`🗑️  Removed ${dupCount} duplicate gamelogs`)

    console.log('✅ GameLog collection is clean')
  } catch (e) {
    console.log('⚠️  GameLog cleanup warning:', e.message)
  }
}

module.exports = connectDB
