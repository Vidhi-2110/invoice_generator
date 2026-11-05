const { ObjectId } = require('mongodb');
const { getCollection, buildDocument, normalizeDoc } = require('../models/Proforma');
const { getCollection: getClientCollection } = require('../models/Client');
const { sendProformaEmail } = require('../services/emailService');
const { buildCompanyFromUser } = require('../models/User');
const { getNumberPrefix } = require('../utils/numberPrefix');

// ─── Atomic Proforma Number Generator ────────────────────────────────────────
/**
 * Generates a unique, sequential proforma invoice number using an atomic
 * MongoDB counter. The counter is stored in a 'counters' collection and
 * is scoped per-user so each user gets their own sequence.
 *
 * @param {import('mongodb').MongoClient} dbClient
 * @param {string} userId - The authenticated user's ID
 * @param {string} prefix - e.g. "FSPI-"
 * @returns {Promise<string>} e.g. "FSPI-0003"
 */
const generateProformaNumber = async (dbClient, userId, prefix = 'FSPI-') => {
  const countersCol = dbClient.db('Invoice').collection('counters');
  const counterId = `proforma_${userId || 'global'}`;

  // Ensure counter is initialized from existing data on first use
  await ensureCounterInitialized(dbClient, userId, prefix);

  const result = await countersCol.findOneAndUpdate(
    { _id: counterId },
    { $inc: { sequenceValue: 1 } },
    { upsert: true, returnDocument: 'after' }
  );

  const seq = result.sequenceValue;
  return `${prefix}${String(seq).padStart(4, '0')}`;
};

/**
 * One-time helper: ensures the counter starts at the correct value by
 * checking the highest existing proforma number for a given user.
 * Called lazily on first create if the counter doesn't already exist.
 */
const ensureCounterInitialized = async (dbClient, userId, prefix = 'FSPI-') => {
  const countersCol = dbClient.db('Invoice').collection('counters');
  const counterId = `proforma_${userId || 'global'}`;

  const existing = await countersCol.findOne({ _id: counterId });
  if (existing) return; // already initialized

  // Find the highest existing proforma number for this user
  const proformaCol = getCollection(dbClient);
  const query = userId ? { userId } : {};
  const docs = await proformaCol.find(query).toArray();

  let maxNumber = 0;
  // Trailing digits, so a custom prefix never resets the sequence
  const regex = /(\d+)$/;

  for (const doc of docs) {
    const numStr = doc.invoiceNumber || '';
    const match = String(numStr).match(regex);
    if (match) {
      const n = parseInt(match[1], 10);
      if (n > maxNumber) maxNumber = n;
    }
  }

  // Initialize counter only if it still doesn't exist (race-safe via upsert + $setOnInsert)
  await countersCol.updateOne(
    { _id: counterId },
    { $setOnInsert: { sequenceValue: maxNumber } },
    { upsert: true }
  );
};

// ─── GET /api/proformas/next-number ──────────────────────────────────────────
const getNextProformaNumber = async (req, res) => {
  try {
    const dbClient = req.app.locals.dbClient;
    const userId = req.user?.id;
    const prefix = await getNumberPrefix(dbClient, userId, 'proforma');
    await ensureCounterInitialized(dbClient, userId, prefix);
    const counter = await dbClient.db('Invoice').collection('counters').findOne({ _id: `proforma_${userId || 'global'}` });
    res.json({ invoiceNumber: `${prefix}${String((counter?.sequenceValue || 0) + 1).padStart(4, '0')}` });
  } catch (err) {
    console.error('[ProformaController] getNextProformaNumber:', err.message);
    res.status(500).json({ error: 'Failed to get next proforma number' });
  }
};

// ─── GET /api/proformas ──────────────────────────────────────────────────────
const getAllProformas = async (req, res) => {
  try {
    const col = getCollection(req.app.locals.dbClient);
    const userId = req.user?.id;
    const query = userId ? { userId } : {};
    const docs = await col.find(query).sort({ createdAt: -1 }).toArray();
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

    // Generate a unique, sequential proforma number server-side
    const userId = req.user?.id;
    const proformaPrefix = await getNumberPrefix(req.app.locals.dbClient, userId, 'proforma');
    const invoiceNumber = await generateProformaNumber(req.app.locals.dbClient, userId, proformaPrefix);

    const doc = buildDocument({ ...req.body, userId, invoiceNumber });
    const result = await col.insertOne(doc);
    const saved = { id: result.insertedId.toString(), ...doc };

    // ── Auto-send email immediately after creation ─────────────────────────
    // Fire-and-forget: don't block the HTTP response on email delivery
    if (saved.email) {
      // Fetch company info from the logged-in user document for personalisation
      let company = {};
      try {
        if (req.user?.id && ObjectId.isValid(req.user.id)) {
          const { getCollection: getUserCol } = require('../models/User');
          const userCol = getUserCol(req.app.locals.dbClient);
          const userDoc = await userCol.findOne({ _id: new ObjectId(req.user.id) });
          if (userDoc) {
            company = buildCompanyFromUser(userDoc);
          }
        }
      } catch (lookupErr) {
        console.warn('[ProformaController] Could not fetch user for company details:', lookupErr.message);
      }

      sendProformaEmail(saved, company)
        .then(async () => {
          await col.updateOne(
            { _id: result.insertedId },
            { $set: { emailSentAt: new Date().toISOString(), emailStatus: 'sent' } }
          );
          console.log(`✅ [ProformaController] Auto-email sent successfully for ${saved.invoiceNumber} to ${saved.email}`);
        })
        .catch(async (mailErr) => {
          console.error(`❌ [ProformaController] Email send failed for ${saved.invoiceNumber}:`, mailErr.message);
          try {
            await col.updateOne(
              { _id: result.insertedId },
              { $set: { emailStatus: 'failed', emailError: mailErr.message } }
            );
          } catch (_) {}
        });
    }

    res.status(201).json(saved);
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
    const { _id, id: _frontendId, invoiceNumber: _ignoredNumber, ...updateData } = req.body;
    const userId = req.user?.id;
    const query = userId ? { _id: new ObjectId(id), userId } : { _id: new ObjectId(id) };

    const updated = await col.findOneAndUpdate(
      query,
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
    const userId = req.user?.id;
    const query = userId ? { _id: new ObjectId(id), userId } : { _id: new ObjectId(id) };
    const result = await col.deleteOne(query);

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Proforma invoice not found' });
    }

    res.json({ success: true, id });
  } catch (err) {
    console.error('[ProformaController] deleteProforma:', err.message);
    res.status(500).json({ error: 'Failed to delete proforma invoice' });
  }
};

// ─── POST /api/proformas/:id/send-email ──────────────────────────────────────
/**
 * Manually (re-)send a Proforma Invoice email for a given proforma ID.
 * Useful for resending or testing without re-creating the proforma.
 */
const sendProformaEmailById = async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid proforma ID' });
  }

  try {
    const col    = getCollection(req.app.locals.dbClient);
    const userId = req.user?.id;
    const query  = userId ? { _id: new ObjectId(id), userId } : { _id: new ObjectId(id) };
    const doc    = await col.findOne(query);

    if (!doc) {
      return res.status(404).json({ error: 'Proforma invoice not found' });
    }

    if (!doc.email) {
      return res.status(400).json({ error: 'This proforma invoice has no client email address.' });
    }

    // Fetch company/sender info from user profile
    let company = {};
    try {
      if (req.user?.id && ObjectId.isValid(req.user.id)) {
        const { getCollection: getUserCol } = require('../models/User');
        const userCol = getUserCol(req.app.locals.dbClient);
        const userDoc = await userCol.findOne({ _id: new ObjectId(req.user.id) });
        if (userDoc) {
          company = buildCompanyFromUser(userDoc);
        }
      }
    } catch (lookupErr) {
      console.warn('[ProformaController] Could not fetch user details for email:', lookupErr.message);
    }

    const proforma = normalizeDoc(doc);
    await sendProformaEmail(proforma, company);

    // Stamp emailSentAt on the document
    await col.updateOne(
      { _id: new ObjectId(id) },
      { $set: { emailSentAt: new Date().toISOString(), emailStatus: 'sent' } }
    );

    res.json({
      success: true,
      message: `Proforma Invoice ${proforma.invoiceNumber} emailed successfully to ${proforma.email}`,
    });
  } catch (err) {
    console.error('[ProformaController] sendProformaEmailById:', err.message);

    // Update emailStatus to 'failed' so we can surface it on the frontend
    try {
      const col = getCollection(req.app.locals.dbClient);
      await col.updateOne(
        { _id: new ObjectId(id) },
        { $set: { emailStatus: 'failed', emailError: err.message } }
      );
    } catch (_) { /* best-effort */ }

    res.status(500).json({ error: `Failed to send email: ${err.message}` });
  }
};

// ─── GET /api/proformas/:id/download ─────────────────────────────────────────
/**
 * Public direct PDF download endpoint so email recipients can download their PDF directly.
 */
const downloadProformaPdf = async (req, res) => {
  const { id } = req.params;

  try {
    const col = getCollection(req.app.locals.dbClient);

    // Support both MongoDB ObjectId and invoiceNumber lookup
    let doc = null;
    if (ObjectId.isValid(id)) {
      doc = await col.findOne({ _id: new ObjectId(id) });
    }
    if (!doc) {
      doc = await col.findOne({ invoiceNumber: id });
    }

    if (!doc) {
      return res.status(404).send('Proforma Invoice not found');
    }

    // Lookup company details from the owner if available
    let company = {};
    if (doc.userId && ObjectId.isValid(doc.userId)) {
      try {
        const { getCollection: getUserCol } = require('../models/User');
        const userCol = getUserCol(req.app.locals.dbClient);
        const userDoc = await userCol.findOne({ _id: new ObjectId(doc.userId) });
        if (userDoc) {
          company = buildCompanyFromUser(userDoc);
        }
      } catch (_) {}
    }

    const { generateProformaPdfBuffer } = require('../services/pdfService');
    const proforma = normalizeDoc(doc);
    const pdfBuffer = await generateProformaPdfBuffer(proforma, company);

    const filename = `Proforma-Invoice-${proforma.invoiceNumber || id}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    return res.end(pdfBuffer);
  } catch (err) {
    console.error('[ProformaController] downloadProformaPdf:', err.message);
    res.status(500).send('Failed to generate PDF');
  }
};

module.exports = {
  getNextProformaNumber,
  getAllProformas,
  createProforma,
  updateProforma,
  deleteProforma,
  sendProformaEmailById,
  downloadProformaPdf,
};
