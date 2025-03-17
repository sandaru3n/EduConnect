// backend/routes/classRoutes.js
const express = require('express');
const router = express.Router();


const { getActiveClasses, getClassMaterials } = require('../controllers/classController');
const authMiddleware = require('../middleware/auth');

router.get('/active', getActiveClasses);


router.get('/:classId/materials', authMiddleware, getClassMaterials);

module.exports = router;