const express = require('express');
const { dbCheck } = require('../middleware/dbCheck');
const { protect } = require('../middleware/authMiddleware');
const {
  getAllInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} = require('../controllers/invoiceController');

const router = express.Router();

router.get('/',      dbCheck, protect, getAllInvoices);
router.post('/',     dbCheck, protect, createInvoice);
router.put('/:id',   dbCheck, protect, updateInvoice);
router.delete('/:id',dbCheck, protect, deleteInvoice);

module.exports = router;
