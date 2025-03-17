// backend/routes/refundRoutes.js
const express = require('express');
const router = express.Router();
const { requestRefund, getRefundRequests, updateRefundStatus, getStudentRefundRequests, reactivateSubscription } = require('../controllers/refundController');
const authMiddleware = require('../middleware/auth');

router.post('/request', authMiddleware, requestRefund); // Student submits refund request
router.get('/all', authMiddleware, getRefundRequests); // Admin views all refund requests
router.put('/status', authMiddleware, updateRefundStatus); // Admin updates refund status
router.get('/my-requests', authMiddleware, getStudentRefundRequests); // Student views their refund requests

module.exports = router;