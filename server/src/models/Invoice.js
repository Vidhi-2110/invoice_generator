const DB_NAME = 'Invoice';
const COLLECTION_NAME = 'invoices';

/**
 * Returns the invoices MongoDB collection.
 * @param {import('mongodb').MongoClient} client
 * @returns {import('mongodb').Collection}
 */
const getCollection = (client) => client.db(DB_NAME).collection(COLLECTION_NAME);

/**
 * Builds a clean invoice document ready for insertion.
 * Strips any client-side `id` field and ensures `createdAt` is always set.
 * @param {object} data - Raw request body
 * @returns {object} MongoDB document
 */
const buildDocument = (data) => {
  const { id, _id, ...rest } = data; // strip frontend id fields
  return {
    ...rest,
    createdAt: data.createdAt || new Date().toISOString(),
  };
};

/**
 * Normalizes a MongoDB document for the frontend by converting `_id` → `id`.
 * @param {object} doc - Raw MongoDB document
 * @returns {object}
 */
const normalizeDoc = ({ _id, ...rest }) => ({ id: _id.toString(), ...rest });

module.exports = { getCollection, buildDocument, normalizeDoc };
