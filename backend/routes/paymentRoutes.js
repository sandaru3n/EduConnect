//backend/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const { subscribeToClass, processSubscriptionPayment } = require('../controllers/paymentController');
const authMiddleware = require('../middleware/auth');

router.post('/subscribe', authMiddleware, subscribeToClass);
router.post("/subscribe-plan", authMiddleware, processSubscriptionPayment);

module.exports = router;