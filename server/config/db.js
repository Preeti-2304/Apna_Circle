const path = require('path');
const mongoose = require('mongoose');

// Ensure mongodb-memory-server caches binary inside server/.cache rather than user home directory
process.env.MONGOMS_DOWNLOAD_DIR = path.join(__dirname, '../.cache');
process.env.MONGOMS_SYSTEM_BINARY_UTF8 = 'true';

let mongoMemoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/apnacircle';
  try {
    // Attempt standard MongoDB connection first (short timeout if no local server running)
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[Database] MongoDB connected successfully to: ${uri}`);
  } catch (err) {
    console.warn(`[Database] Standard MongoDB connection failed (${err.message}). Initializing embedded database fallback...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'apnacircle',
        },
      });
      const memoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[Database] Embedded MongoMemoryServer connected successfully at ${memoryUri}`);
    } catch (memErr) {
      console.error('[Database] Failed to connect to MongoDB or memory server:', memErr);
      throw memErr;
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
    console.log('[Database] Disconnected');
  } catch (error) {
    console.error('[Database] Error during disconnect:', error);
  }
};

module.exports = { connectDB, disconnectDB };
