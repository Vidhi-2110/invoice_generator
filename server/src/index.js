require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5001;

const server = http.createServer(app);

server.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  app.locals.dbClient = await connectDB();
});