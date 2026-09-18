const { MongoClient, ServerApiVersion } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI;

/**
 * Connects to MongoDB Atlas and returns the client.
 * TLS flags are embedded in the URI for Node.js v24 / OpenSSL 3 compatibility.
 * @returns {Promise<MongoClient|null>}
 */
async function connectDB() {
  if (!MONGO_URI) {
    console.error('❌ MONGO_URI is not defined in .env file');
    return null;
  }

  const client = new MongoClient(MONGO_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
    serverSelectionTimeoutMS: 10000,
  });

  try {
    await client.connect();
    await client.db().admin().ping();
    console.log('✅ MongoDB connected successfully!');
    return client;
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    return null;
  }
}

module.exports = { connectDB };
