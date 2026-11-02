const express = require('express');
const { dbCheck } = require('../middleware/dbCheck');
const { protect } = require('../middleware/authMiddleware');
const { getAllSacCodes } = require('../controllers/sacCodeController');

const router = express.Router();

router.get('/', dbCheck, protect, getAllSacCodes);

module.exports = router;
