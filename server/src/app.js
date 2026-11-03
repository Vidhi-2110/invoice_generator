const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const proformaRoutes = require('./routes/proformaRoutes');
const clientRoutes = require('./routes/clientRoutes');
const sacCodeRoutes = require('./routes/sacCodeRoutes');

const app = express();

// ─── Security Headers ────────────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Raised limit: company logo/e-sign/stamp are sent as base64 data URLs
app.use(express.json({ limit: '10mb' }));

// ─── Rate Limiters ───────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // max 20 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/proformas', proformaRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/sac-codes', sacCodeRoutes);

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

// ─── Global Error Handler ────────────────────────────────────────────────────
// Must be defined after all routes
app.use((err, req, res, next) => {
  console.error('[GlobalError]', err.stack || err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

module.exports = app;
