const express = require('express');
const { dbCheck } = require('../middleware/dbCheck');
const {
  getAllInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice,
} = require('../controllers/invoiceController');

const router = express.Router();

router.get('/',      dbCheck, getAllInvoices);
router.post('/',     dbCheck, createInvoice);
router.put('/:id',   dbCheck, updateInvoice);
router.delete('/:id',dbCheck, deleteInvoice);

module.exports = router;
