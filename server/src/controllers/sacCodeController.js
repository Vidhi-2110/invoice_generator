const { getCollection, normalizeDoc } = require('../models/SacCode');

// ─── GET /api/sac-codes ──────────────────────────────────────────────────────
const getAllSacCodes = async (req, res) => {
  try {
    const col = getCollection(req.app.locals.dbClient);
    const docs = await col.find({}).sort({ sortOrder: 1 }).toArray();
    res.json(docs.map(normalizeDoc));
  } catch (err) {
    console.error('[SacCodeController] getAllSacCodes:', err.message);
    res.status(500).json({ error: 'Failed to fetch SAC codes' });
  }
};

module.exports = { getAllSacCodes };
