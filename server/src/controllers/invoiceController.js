const { ObjectId } = require('mongodb');
const { getCollection, buildDocument, normalizeDoc } = require('../models/Invoice');

// ─── Atomic counter helpers (same pattern as proformaController) ──────────────

/**
 * Ensure the invoice counter exists for this user.
 * On first run, scan existing invoices to find the current max number.
 */
async function ensureInvoiceCounterInitialized(dbClient, userId, prefix) {
  const counters = dbClient.db().collection('counters');
  const counterKey = `invoice_${userId}`;

  const existing = await counters.findOne({ _id: counterKey });
  if (existing) return; // already initialised

  // Scan invoices to find the highest existing number
  const col = dbClient.db().collection('invoices');
  const docs = await col
    .find({ userId, invoiceNumber: { $regex: `^${prefix}` } })
    .project({ invoiceNumber: 1 })
    .toArray();

  let maxSeq = 0;
  for (const doc of docs) {
    const parts = doc.invoiceNumber?.split('-');
    const seq = parseInt(parts?.[1] || '0', 10);
    if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
  }

  // Insert with upsert so concurrent calls are safe
  await counters.updateOne(
    { _id: counterKey },
    { $setOnInsert: { seq: maxSeq } },
    { upsert: true }
  );
}

/**
 * Atomically increment the invoice counter and return the next formatted number.
 * e.g. "FSIN-0003"
 */
async function generateInvoiceNumber(dbClient, userId, prefix) {
  await ensureInvoiceCounterInitialized(dbClient, userId, prefix);

  const counters = dbClient.db().collection('counters');
  const counterKey = `invoice_${userId}`;

  const result = await counters.findOneAndUpdate(
    { _id: counterKey },
    { $inc: { seq: 1 } },
    { returnDocument: 'after', upsert: true }
  );

  const seq = result.seq;
  return `${prefix}${String(seq).padStart(4, '0')}`;
}

// ─── GET /api/invoices ────────────────────────────────────────────────────────
const getAllInvoices = async (req, res) => {
  try {
    const col = getCollection(req.app.locals.dbClient);
    const userId = req.user?.id;
    const query = userId ? { userId } : {};
    const docs = await col.find(query).sort({ createdAt: -1 }).toArray();
    res.json(docs.map(normalizeDoc));
  } catch (err) {
    console.error('[InvoiceController] getAllInvoices:', err.message);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

// ─── POST /api/invoices ───────────────────────────────────────────────────────
const createInvoice = async (req, res) => {
  try {
    const dbClient = req.app.locals.dbClient;
    const userId = req.user?.id;

    // Always generate the invoice number server-side using the atomic counter
    const prefix = 'FSIN-';
    const invoiceNumber = await generateInvoiceNumber(dbClient, userId, prefix);

    const col = getCollection(dbClient);
    const doc = buildDocument({
      ...req.body,
      invoiceNumber, // override whatever the client sent
      userId,
    });
    const result = await col.insertOne(doc);
    res.status(201).json(normalizeDoc({ _id: result.insertedId, ...doc }));
  } catch (err) {
    console.error('[InvoiceController] createInvoice:', err.message);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
};

// ─── PUT /api/invoices/:id ────────────────────────────────────────────────────
const updateInvoice = async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid invoice ID' });
  }

  try {
    const col = getCollection(req.app.locals.dbClient);
    // Strip immutable fields from the update payload
    const { _id, id: _frontendId, invoiceNumber: _num, ...updateData } = req.body;
    const userId = req.user?.id;
    const query = userId ? { _id: new ObjectId(id), userId } : { _id: new ObjectId(id) };

    const updated = await col.findOneAndUpdate(
      query,
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

// ─── DELETE /api/invoices/:id ─────────────────────────────────────────────────
const deleteInvoice = async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid invoice ID' });
  }

  try {
    const col = getCollection(req.app.locals.dbClient);
    const userId = req.user?.id;
    const query = userId ? { _id: new ObjectId(id), userId } : { _id: new ObjectId(id) };
    const result = await col.deleteOne(query);

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
