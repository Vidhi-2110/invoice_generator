const express = require('express');
const { dbCheck } = require('../middleware/dbCheck');
const { protect } = require('../middleware/authMiddleware');
const {
  getAllInvoices,
  getNextInvoiceNumber,
  sendInvoiceEmailById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} = require('../controllers/invoiceController');

const router = express.Router();

router.get('/next-number', dbCheck, protect, getNextInvoiceNumber);
router.get('/',      dbCheck, protect, getAllInvoices);
router.post('/',     dbCheck, protect, createInvoice);
router.post('/:id/send-email', dbCheck, protect, sendInvoiceEmailById);
router.put('/:id',   dbCheck, protect, updateInvoice);
router.delete('/:id',dbCheck, protect, deleteInvoice);

module.exports = router;
