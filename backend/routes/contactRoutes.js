// backend/routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const { submitContactMessage, getContactMessages, deleteContactMessage } = require('../controllers/contactController');
const authMiddleware = require('../middleware/auth');

router.post('/submit', submitContactMessage); // Public route
router.get('/', authMiddleware, getContactMessages); // Admin only
router.delete('/:id', authMiddleware, deleteContactMessage); // Admin only

module.exports = router;