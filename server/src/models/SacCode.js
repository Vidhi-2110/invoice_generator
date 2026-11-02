const DB_NAME = 'Invoice';
const COLLECTION_NAME = 'sac_codes';

/** Predefined master list. `sortOrder` keeps the dropdown in this order. */
const SAC_CODE_SEED = [
  { code: '998314', description: 'IT Design and Development Services', applicableWork: 'Software, website, mobile app, CRM, ERP, AI/ML development' },
  { code: '998313', description: 'IT Consulting and Support Services', applicableWork: 'IT consulting, technical consultancy, system analysis' },
  { code: '998315', description: 'Hosting and IT Infrastructure Provisioning Services', applicableWork: 'Cloud hosting, server provisioning' },
  { code: '998316', description: 'IT Infrastructure and Network Management Services', applicableWork: 'DevOps, infrastructure and cloud management' },
  { code: '998319', description: 'Other Information Technology Services', applicableWork: 'Other IT services not classified above' },
  { code: '997331', description: 'Licensing Services for Computer Software and Databases', applicableWork: 'Software licensing and SaaS licensing' },
  { code: '998391', description: 'Specialty Design Services', applicableWork: 'Graphic design, UI/UX, brochure, logo and branding design' },
  { code: '998513', description: 'Contract Staffing Services', applicableWork: 'Supplying developers on a contractual staffing basis' },
];

/**
 * Returns the SAC codes MongoDB collection.
 * @param {import('mongodb').MongoClient} client
 * @returns {import('mongodb').Collection}
 */
const getCollection = (client) => client.db(DB_NAME).collection(COLLECTION_NAME);

/**
 * Normalizes a MongoDB document for the frontend by converting `_id` → `id`.
 * @param {object} doc - Raw MongoDB document
 * @returns {object}
 */
const normalizeDoc = ({ _id, ...rest }) => ({ id: _id.toString(), ...rest });

/**
 * Inserts any missing predefined SAC codes. Safe to run on every server start:
 * records that already exist are left untouched, so edits made directly in the
 * database are preserved.
 * @param {import('mongodb').MongoClient} client
 */
const seedSacCodes = async (client) => {
  const col = getCollection(client);
  await col.createIndex({ code: 1 }, { unique: true });
  await col.bulkWrite(
    SAC_CODE_SEED.map((sac, index) => ({
      updateOne: {
        filter: { code: sac.code },
        update: {
          $setOnInsert: { ...sac, sortOrder: index + 1, createdAt: new Date().toISOString() },
        },
        upsert: true,
      },
    }))
  );
};

module.exports = { getCollection, normalizeDoc, seedSacCodes };
