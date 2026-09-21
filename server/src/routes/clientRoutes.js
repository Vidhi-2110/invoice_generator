const express = require('express');
const { dbCheck } = require('../middleware/dbCheck');
const { protect } = require('../middleware/authMiddleware');
const {
  getAllClients,
  createClient,
  updateClient,
  deleteClient,
} = require('../controllers/clientController');

const router = express.Router();

router.get('/',       dbCheck, protect, getAllClients);
router.post('/',      dbCheck, protect, createClient);
router.put('/:id',    dbCheck, protect, updateClient);
router.delete('/:id', dbCheck, protect, deleteClient);

module.exports = router;
