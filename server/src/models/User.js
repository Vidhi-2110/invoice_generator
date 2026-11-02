const DB_NAME = 'Invoice';
const COLLECTION_NAME = 'users';

/**
 * Returns the users MongoDB collection.
 * @param {import('mongodb').MongoClient} client
 * @returns {import('mongodb').Collection}
 */
const getCollection = (client) => client.db(DB_NAME).collection(COLLECTION_NAME);

/**
 * Builds a new user document for insertion.
 * @param {object} data - { name, email, passwordHash, company }
 * @returns {object} MongoDB document
 */
const buildDocument = ({ name, email, passwordHash, company = '' }) => ({
  name: name.trim(),
  email: email.toLowerCase().trim(),
  passwordHash,
  company: company.trim(),
  createdAt: new Date().toISOString(),
});

/**
 * Normalizes a MongoDB user document for the frontend.
 * Removes passwordHash and converts _id → id.
 * @param {object} doc
 * @returns {object}
 */
const normalizeDoc = ({ _id, passwordHash, companyAssets, ...rest }) => ({
  id: _id.toString(),
  ...rest,
});

/**
 * Builds the company details object used for PDF / email generation.
 * Includes the logo, e-sign and stamp saved from the Settings page.
 * @param {object} userDoc
 * @returns {object}
 */
const buildCompanyFromUser = (userDoc) => {
  const assets = userDoc.companyAssets || {};
  return {
    name         : assets.companyName || userDoc.company || userDoc.name || '',
    email        : assets.email       || userDoc.email   || '',
    phone        : assets.phone       || userDoc.phone   || '',
    address      : assets.address     || userDoc.address || '',
    bankName     : assets.bankName    || userDoc.bankName || '',
    accountName  : assets.accountName || userDoc.accountName || userDoc.company || userDoc.name || '',
    accountNumber: assets.accountNumber || userDoc.accountNumber || '',
    ifscCode     : assets.ifscCode    || userDoc.ifscCode || '',
    branchName   : assets.branchName  || userDoc.branchName || '',
    logo         : assets.logo  || null,
    esign        : assets.esign || null,
    stamp        : assets.stamp || null,
  };
};

module.exports = { getCollection, buildDocument, normalizeDoc, buildCompanyFromUser };
