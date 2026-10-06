const express = require('express');
const { dbCheck } = require('../middleware/dbCheck');
const { protect } = require('../middleware/authMiddleware');
const {
  getAllProformas,
  createProforma,
  updateProforma,
  deleteProforma,
  sendProformaEmailById,
  downloadProformaPdf,
} = require('../controllers/proformaController');

const router = express.Router();

// ── Public direct PDF download (from email CTA button) ───────────────────────
router.get('/:id/download', dbCheck, downloadProformaPdf);
router.get('/download/:id', dbCheck, downloadProformaPdf);

router.get('/',                   dbCheck, protect, getAllProformas);
router.post('/',                  dbCheck, protect, createProforma);
router.put('/:id',                dbCheck, protect, updateProforma);
router.delete('/:id',             dbCheck, protect, deleteProforma);

// ── Email dispatch ──────────────────────────────────────────────────────────
// POST /api/proformas/:id/send-email  → sends (or resends) the invoice email
router.post('/:id/send-email',    dbCheck, protect, sendProformaEmailById);

module.exports = router;
