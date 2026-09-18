const express = require('express');
const { dbCheck } = require('../middleware/dbCheck');
const {
  getAllProformas,
  createProforma,
  updateProforma,
  deleteProforma,
} = require('../controllers/proformaController');

const router = express.Router();

router.get('/',       dbCheck, getAllProformas);
router.post('/',      dbCheck, createProforma);
router.put('/:id',    dbCheck, updateProforma);
router.delete('/:id', dbCheck, deleteProforma);

module.exports = router;
