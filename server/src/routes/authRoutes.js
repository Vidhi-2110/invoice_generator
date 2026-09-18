const express = require('express');
const { dbCheck } = require('../middleware/dbCheck');
const { protect } = require('../middleware/authMiddleware');
const { register, login, getMe } = require('../controllers/authController');

const router = express.Router();

router.post('/register', dbCheck, register);
router.post('/login',    dbCheck, login);
router.get('/me',        dbCheck, protect, getMe);

module.exports = router;
