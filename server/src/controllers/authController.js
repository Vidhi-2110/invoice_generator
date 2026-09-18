const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getCollection, buildDocument, normalizeDoc } = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/** Signs a JWT token for the given user id */
const signToken = (userId) =>
  jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

// ─── POST /api/auth/register ─────────────────────────────────────────────────
const register = async (req, res) => {
  const { name, email, password, company } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required.' });
  }

  try {
    const col = getCollection(req.app.locals.dbClient);

    // Check duplicate email
    const existing = await col.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Hash password and save user
    const passwordHash = await bcrypt.hash(password, 12);
    const doc = buildDocument({ name, email, passwordHash, company });
    const result = await col.insertOne(doc);

    const user = normalizeDoc({ _id: result.insertedId, ...doc });
    const token = signToken(user.id);

    res.status(201).json({ user, token });
  } catch (err) {
    console.error('[AuthController] register:', err.message);
    res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
};

// ─── POST /api/auth/login ────────────────────────────────────────────────────
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const col = getCollection(req.app.locals.dbClient);

    const userDoc = await col.findOne({ email: email.toLowerCase().trim() });
    if (!userDoc) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, userDoc.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = normalizeDoc(userDoc);
    const token = signToken(user.id);

    res.json({ user, token });
  } catch (err) {
    console.error('[AuthController] login:', err.message);
    res.status(500).json({ error: 'Failed to sign in. Please try again.' });
  }
};

// ─── GET /api/auth/me ────────────────────────────────────────────────────────
// Protected — req.user is attached by authMiddleware
const getMe = async (req, res) => {
  try {
    const col = getCollection(req.app.locals.dbClient);
    const { ObjectId } = require('mongodb');
    const userDoc = await col.findOne({ _id: new ObjectId(req.user.id) });

    if (!userDoc) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ user: normalizeDoc(userDoc) });
  } catch (err) {
    console.error('[AuthController] getMe:', err.message);
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
};

module.exports = { register, login, getMe };
