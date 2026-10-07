const express = require('express');
const { dbCheck } = require('../middleware/dbCheck');
const { protect } = require('../middleware/authMiddleware');
const { register, login, getMe, updateProfile, updateCompanyAssets } = require('../controllers/authController');

const router = express.Router();

router.post('/register',    dbCheck, register);
router.post('/login',       dbCheck, login);
router.get('/me',           dbCheck, protect, getMe);
router.put('/profile',      dbCheck, protect, updateProfile);
router.put('/company-assets', dbCheck, protect, updateCompanyAssets);

module.exports = router;
