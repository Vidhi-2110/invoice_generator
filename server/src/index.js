require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/db');
const { seedSacCodes } = require('./models/SacCode');

const PORT = process.env.PORT || 5001;

const server = http.createServer(app);

server.listen(PORT, '0.0.0.0', async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  app.locals.dbClient = await connectDB();

  if (app.locals.dbClient) {
    try {
      await seedSacCodes(app.locals.dbClient);
    } catch (err) {
      console.error('❌ SAC code seeding failed:', err.message);
    }
  }
});
