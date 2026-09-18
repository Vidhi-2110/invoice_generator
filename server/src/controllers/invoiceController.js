const { ObjectId } = require('mongodb');
const { getCollection, buildDocument, normalizeDoc } = require('../models/Invoice');

// ─── GET /api/invoices ───────────────────────────────────────────────────────
const getAllInvoices = async (req, res) => {
  try {
    const col = getCollection(req.app.locals.dbClient);
    const docs = await col.find({}).sort({ createdAt: -1 }).toArray();
    res.json(docs.map(normalizeDoc));
  } catch (err) {
    console.error('[InvoiceController] getAllInvoices:', err.message);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

// ─── POST /api/invoices ──────────────────────────────────────────────────────
const createInvoice = async (req, res) => {
  try {
    const col = getCollection(req.app.locals.dbClient);
    const doc = buildDocument(req.body);
    const result = await col.insertOne(doc);
    res.status(201).json({ id: result.insertedId.toString(), ...doc });
  } catch (err) {
    console.error('[InvoiceController] createInvoice:', err.message);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
};

// ─── PUT /api/invoices/:id ───────────────────────────────────────────────────
const updateInvoice = async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid invoice ID' });
  }

  try {
    const col = getCollection(req.app.locals.dbClient);
    const { _id, id: _frontendId, ...updateData } = req.body;

    const updated = await col.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!updated) return res.status(404).json({ error: 'Invoice not found' });

    res.json(normalizeDoc(updated));
  } catch (err) {
    console.error('[InvoiceController] updateInvoice:', err.message);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
};

// ─── DELETE /api/invoices/:id ────────────────────────────────────────────────
const deleteInvoice = async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid invoice ID' });
  }

  try {
    const col = getCollection(req.app.locals.dbClient);
    const result = await col.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json({ success: true, id });
  } catch (err) {
    console.error('[InvoiceController] deleteInvoice:', err.message);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
};

module.exports = { getAllInvoices, createInvoice, updateInvoice, deleteInvoice };
