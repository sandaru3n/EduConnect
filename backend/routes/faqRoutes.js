// backend/routes/faqRoutes.js
const express = require('express');
const router = express.Router();
const { getAllFAQs, createFAQ, updateFAQ, deleteFAQ } = require('../controllers/faqController');
const authMiddleware = require('../middleware/auth');

// Public route to get all FAQs
router.get('/', getAllFAQs);

// Admin-only routes
router.post('/', authMiddleware, createFAQ);
router.put('/:id', authMiddleware, updateFAQ);
router.delete('/:id', authMiddleware, deleteFAQ);

module.exports = router;