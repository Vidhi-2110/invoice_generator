const DB_NAME = 'Invoice';
const COLLECTION_NAME = 'proformas';

/**
 * Returns the proformas MongoDB collection.
 * @param {import('mongodb').MongoClient} client
 * @returns {import('mongodb').Collection}
 */
const getCollection = (client) => client.db(DB_NAME).collection(COLLECTION_NAME);

/**
 * Builds a clean proforma document for insertion.
 * Strips client-side id fields and ensures createdAt is set.
 * @param {object} data - Raw request body
 * @returns {object} MongoDB document
 */
const buildDocument = (data) => {
  const { id, _id, ...rest } = data;
  return {
    ...rest,
    createdAt: data.createdAt || new Date().toISOString(),
  };
};

/**
 * Normalizes a MongoDB document for the frontend (_id → id).
 * @param {object} doc
 * @returns {object}
 */
const normalizeDoc = ({ _id, ...rest }) => ({ id: _id.toString(), ...rest });

module.exports = { getCollection, buildDocument, normalizeDoc };
