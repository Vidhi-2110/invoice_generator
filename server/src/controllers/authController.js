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

// ─── PUT /api/auth/profile ───────────────────────────────────────────────────
// Protected — updates name, email, password, and/or avatar
const updateProfile = async (req, res) => {
  const { name, email, currentPassword, newPassword, avatar } = req.body;

  try {
    const col = getCollection(req.app.locals.dbClient);
    const { ObjectId } = require('mongodb');
    const userDoc = await col.findOne({ _id: new ObjectId(req.user.id) });

    if (!userDoc) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const updates = {};

    // Update name
    if (name && name.trim()) updates.name = name.trim();

    // Update email — check no duplicate
    if (email && email.toLowerCase().trim() !== userDoc.email) {
      const duplicate = await col.findOne({ email: email.toLowerCase().trim() });
      if (duplicate) {
        return res.status(409).json({ error: 'This email is already in use by another account.' });
      }
      updates.email = email.toLowerCase().trim();
    }

    // Update password — require current password verification
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to set a new password.' });
      }
      const isMatch = await bcrypt.compare(currentPassword, userDoc.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Current password is incorrect.' });
      }
      updates.passwordHash = await bcrypt.hash(newPassword, 12);
    }

    // Update avatar (stored as base64 data URL)
    if (avatar !== undefined) {
      updates.avatar = avatar; // null to remove, or base64 string
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No changes provided.' });
    }

    await col.updateOne({ _id: new ObjectId(req.user.id) }, { $set: updates });

    // Return fresh user doc
    const updatedDoc = await col.findOne({ _id: new ObjectId(req.user.id) });
    res.json({ user: normalizeDoc(updatedDoc) });
  } catch (err) {
    console.error('[AuthController] updateProfile:', err.message);
    res.status(500).json({ error: 'Failed to update profile. Please try again.' });
  }
};

// ─── PUT /api/auth/company-assets ────────────────────────────────────────────
// Protected — saves logo, e-sign and stamp (base64 data URLs) used in emailed PDFs
const ASSET_KEYS = ['logo', 'esign', 'stamp'];

const updateCompanyAssets = async (req, res) => {
  const updates = {};

  for (const key of ASSET_KEYS) {
    if (req.body[key] === undefined) continue;
    const val = req.body[key];
    if (val !== null && !(typeof val === 'string' && val.startsWith('data:image'))) {
      return res.status(400).json({ error: `Invalid ${key} image.` });
    }
    updates[`companyAssets.${key}`] = val;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No changes provided.' });
  }

  try {
    const col = getCollection(req.app.locals.dbClient);
    const { ObjectId } = require('mongodb');
    const result = await col.updateOne({ _id: new ObjectId(req.user.id) }, { $set: updates });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('[AuthController] updateCompanyAssets:', err.message);
    res.status(500).json({ error: 'Failed to save company assets.' });
  }
};

module.exports = { register, login, getMe, updateProfile, updateCompanyAssets };

