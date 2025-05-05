//backend/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const { subscribeToClass, processSubscriptionPayment,subscribeToStudyPack,getClassDetails,getStudyPackDetails } = require('../controllers/paymentController');
const authMiddleware = require('../middleware/auth');

router.post('/subscribe', authMiddleware, subscribeToClass);
router.post("/subscribe-plan", authMiddleware, processSubscriptionPayment);
// Add to existing paymentRoutes.js
router.post('/subscribe-studypack', authMiddleware, subscribeToStudyPack);

router.get('/class-details/:classId', authMiddleware, getClassDetails); // New route for class details

router.get('/studypack-details/:studyPackId', authMiddleware, getStudyPackDetails); // New route for study pack details

module.exports = router;