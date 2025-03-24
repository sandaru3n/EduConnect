//backend/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const { subscribeToClass, processSubscriptionPayment,subscribeToStudyPack } = require('../controllers/paymentController');
const authMiddleware = require('../middleware/auth');

router.post('/subscribe', authMiddleware, subscribeToClass);
router.post("/subscribe-plan", authMiddleware, processSubscriptionPayment);
// Add to existing paymentRoutes.js
router.post('/subscribe-studypack', authMiddleware, subscribeToStudyPack);

module.exports = router;