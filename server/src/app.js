const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const proformaRoutes = require('./routes/proformaRoutes');
const clientRoutes = require('./routes/clientRoutes');

const app = express();

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
// Raised limit: company logo/e-sign/stamp are sent as base64 data URLs
app.use(express.json({ limit: '10mb' }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/proformas', proformaRoutes);
app.use('/api/clients', clientRoutes);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  const client = req.app.locals.dbClient;
  let dbStatus = 'disconnected';

  if (client) {
    try {
      await client.db().admin().ping();
      dbStatus = 'connected';
    } catch {
      dbStatus = 'disconnected';
    }
  }

  res.json({ status: 'Server is running', mongodb: dbStatus });
});

module.exports = app;
