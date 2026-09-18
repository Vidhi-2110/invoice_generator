const { ObjectId } = require('mongodb');
const { getCollection, buildDocument, normalizeDoc } = require('../models/Proforma');

// ─── GET /api/proformas ──────────────────────────────────────────────────────
const getAllProformas = async (req, res) => {
  try {
    const col = getCollection(req.app.locals.dbClient);
    const docs = await col.find({}).sort({ createdAt: -1 }).toArray();
    res.json(docs.map(normalizeDoc));
  } catch (err) {
    console.error('[ProformaController] getAllProformas:', err.message);
    res.status(500).json({ error: 'Failed to fetch proforma invoices' });
  }
};

// ─── POST /api/proformas ─────────────────────────────────────────────────────
const createProforma = async (req, res) => {
  try {
    const col = getCollection(req.app.locals.dbClient);
    const doc = buildDocument(req.body);
    const result = await col.insertOne(doc);
    res.status(201).json({ id: result.insertedId.toString(), ...doc });
  } catch (err) {
    console.error('[ProformaController] createProforma:', err.message);
    res.status(500).json({ error: 'Failed to create proforma invoice' });
  }
};

// ─── PUT /api/proformas/:id ──────────────────────────────────────────────────
const updateProforma = async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid proforma ID' });
  }

  try {
    const col = getCollection(req.app.locals.dbClient);
    const { _id, id: _frontendId, ...updateData } = req.body;

    const updated = await col.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!updated) return res.status(404).json({ error: 'Proforma invoice not found' });

    res.json(normalizeDoc(updated));
  } catch (err) {
    console.error('[ProformaController] updateProforma:', err.message);
    res.status(500).json({ error: 'Failed to update proforma invoice' });
  }
};

// ─── DELETE /api/proformas/:id ───────────────────────────────────────────────
const deleteProforma = async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid proforma ID' });
  }

  try {
    const col = getCollection(req.app.locals.dbClient);
    const result = await col.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Proforma invoice not found' });
    }

    res.json({ success: true, id });
  } catch (err) {
    console.error('[ProformaController] deleteProforma:', err.message);
    res.status(500).json({ error: 'Failed to delete proforma invoice' });
  }
};

module.exports = { getAllProformas, createProforma, updateProforma, deleteProforma };
