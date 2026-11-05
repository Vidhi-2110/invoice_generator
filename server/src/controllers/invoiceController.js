const { ObjectId } = require('mongodb');
const { getCollection, buildDocument, normalizeDoc } = require('../models/Invoice');
const { getNumberPrefix } = require('../utils/numberPrefix');
const { sendInvoiceEmail } = require('../services/emailService');
const { buildCompanyFromUser } = require('../models/User');

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
    .find({ userId, invoiceNumber: { $exists: true } })
    .project({ invoiceNumber: 1 })
    .toArray();

  let maxSeq = 0;
  for (const doc of docs) {
    // Trailing digits of e.g. "FS/26-27/0004" or the older "FSIN-0004"
    const seq = parseInt(String(doc.invoiceNumber || '').match(/(\d+)$/)?.[1] || '0', 10);
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
 * e.g. "FS/26-27/0003"
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

/**
 * Peek at the number the next invoice will get, without consuming it.
 */
async function peekInvoiceNumber(dbClient, userId, prefix) {
  await ensureInvoiceCounterInitialized(dbClient, userId, prefix);
  const counter = await dbClient.db().collection('counters').findOne({ _id: `invoice_${userId}` });
  return `${prefix}${String((counter?.seq || 0) + 1).padStart(4, '0')}`;
}

// ─── POST /api/invoices/:id/send-email ────────────────────────────────────────
const sendInvoiceEmailById = async (req, res) => {
  const { id } = req.params;
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid invoice ID' });
  }

  const col = getCollection(req.app.locals.dbClient);
  try {
    const userId = req.user?.id;
    const query = userId ? { _id: new ObjectId(id), userId } : { _id: new ObjectId(id) };
    const doc = await col.findOne(query);
    if (!doc) return res.status(404).json({ error: 'Invoice not found' });
    if (!doc.email) {
      return res.status(400).json({ error: 'This invoice has no client email address.' });
    }

    // Sender/company details come from the user's Company Settings
    let company = {};
    try {
      if (userId && ObjectId.isValid(userId)) {
        const { getCollection: getUserCol } = require('../models/User');
        const userDoc = await getUserCol(req.app.locals.dbClient).findOne({ _id: new ObjectId(userId) });
        if (userDoc) company = buildCompanyFromUser(userDoc);
      }
    } catch (lookupErr) {
      console.warn('[InvoiceController] Could not fetch user details for email:', lookupErr.message);
    }

    const invoice = normalizeDoc(doc);
    await sendInvoiceEmail(invoice, company);

    await col.updateOne(
      { _id: new ObjectId(id) },
      { $set: { emailSentAt: new Date().toISOString(), emailStatus: 'sent' }, $unset: { emailError: '' } }
    );

    res.json({
      success: true,
      message: `Invoice ${invoice.invoiceNumber} emailed successfully to ${invoice.email}`,
    });
  } catch (err) {
    console.error('[InvoiceController] sendInvoiceEmailById:', err.message);
    try {
      await col.updateOne(
        { _id: new ObjectId(id) },
        { $set: { emailStatus: 'failed', emailError: err.message } }
      );
    } catch (_) { /* best-effort */ }
    res.status(500).json({ error: `Failed to send email: ${err.message}` });
  }
};

// ─── GET /api/invoices/next-number ────────────────────────────────────────────
const getNextInvoiceNumber = async (req, res) => {
  try {
    const invoiceNumber = await peekInvoiceNumber(
      req.app.locals.dbClient,
      req.user?.id,
      await getNumberPrefix(req.app.locals.dbClient, req.user?.id, 'invoice')
    );
    res.json({ invoiceNumber });
  } catch (err) {
    console.error('[InvoiceController] getNextInvoiceNumber:', err.message);
    res.status(500).json({ error: 'Failed to get next invoice number' });
  }
};

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
    // Prefix is chosen by the user in Company Settings
    const prefix = await getNumberPrefix(dbClient, userId, 'invoice');
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

module.exports = {
  sendInvoiceEmailById,
  getNextInvoiceNumber, getAllInvoices, createInvoice, updateInvoice, deleteInvoice };
