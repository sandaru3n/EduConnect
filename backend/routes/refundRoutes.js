// backend/routes/refundRoutes.js
const express = require('express');
const router = express.Router();
const { requestRefund, getRefundRequests, updateRefundStatus, getStudentRefundRequests, reactivateSubscription } = require('../controllers/refundController');
const authMiddleware = require('../middleware/auth');

const multer = require('multer');
const path = require('path');
const fs = require('fs');


// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "../uploads/refunds");
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const filename = `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, filename);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPEG and PNG files are allowed"), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB
});

router.post('/request', authMiddleware, upload.single('proof'), requestRefund); // Student submits refund request with proof
router.get('/all', authMiddleware, getRefundRequests); // Admin views all refund requests
router.put('/status', authMiddleware, updateRefundStatus); // Admin updates refund status
router.get('/my-requests', authMiddleware, getStudentRefundRequests); // Student views their refund requests

module.exports = router;