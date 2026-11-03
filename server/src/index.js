require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/db');
const { seedSacCodes } = require('./models/SacCode');

const PORT = process.env.PORT || 5001;

// ─── Start server only after DB is ready ─────────────────────────────────────
(async () => {
  try {
    const dbClient = await connectDB();
    app.locals.dbClient = dbClient;

    if (dbClient) {
      try {
        await seedSacCodes(dbClient);
      } catch (err) {
        console.error('⚠️  SAC code seeding failed:', err.message);
      }
    }

    const server = http.createServer(app);
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

    // Graceful shutdown
    const shutdown = (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        if (dbClient) {
          await dbClient.close();
          console.log('✅ MongoDB connection closed.');
        }
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
})();
