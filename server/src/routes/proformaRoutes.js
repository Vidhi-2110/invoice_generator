const express = require('express');
const { dbCheck } = require('../middleware/dbCheck');
const { protect } = require('../middleware/authMiddleware');
const {
  getAllProformas,
  createProforma,
  updateProforma,
  deleteProforma,
} = require('../controllers/proformaController');

const router = express.Router();

router.get('/',       dbCheck, protect, getAllProformas);
router.post('/',      dbCheck, protect, createProforma);
router.put('/:id',    dbCheck, protect, updateProforma);
router.delete('/:id', dbCheck, protect, deleteProforma);

module.exports = router;
