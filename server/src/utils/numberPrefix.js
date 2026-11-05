const { ObjectId } = require('mongodb');
const { getCollection } = require('../models/User');

const DEFAULT_PREFIXES = {
  invoice: 'FS/26-27/',
  proforma: 'FSPI-',
};

// 1–20 chars: letters, digits and - / _ .  (e.g. "INV-", "FS/26-27/", "ACME_")
const PREFIX_PATTERN = /^[A-Za-z0-9][A-Za-z0-9\-/_.]{0,19}$/;

const isValidNumberPrefix = (value) => PREFIX_PATTERN.test(String(value || ''));

/**
 * Returns the document-number prefix the user chose in Company Settings,
 * or the default when none is set. `kind` is 'invoice' or 'proforma'.
 */
const getNumberPrefix = async (dbClient, userId, kind) => {
  const fallback = DEFAULT_PREFIXES[kind];
  if (!userId || !ObjectId.isValid(userId)) return fallback;
  const user = await getCollection(dbClient).findOne(
    { _id: new ObjectId(userId) },
    { projection: { companyAssets: 1 } }
  );
  const saved = user?.companyAssets?.[`${kind}Prefix`];
  return saved && isValidNumberPrefix(saved) ? saved : fallback;
};

module.exports = { DEFAULT_PREFIXES, isValidNumberPrefix, getNumberPrefix };
