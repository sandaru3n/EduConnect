const express = require('express');
const router = express.Router();
const { subscribeToClass } = require('../controllers/paymentController');
const authMiddleware = require('../middleware/auth');

router.post('/subscribe', authMiddleware, subscribeToClass);

module.exports = router;