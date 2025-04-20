// backend/routes/classRoutes.js
const express = require('express');
const router = express.Router();
const { 
    getActiveClasses, 
    getClassMaterials, 
    getClassesByTeacher,
    startVideoAccess,
    requestVideoExtension,
    getExtensionRequests,
    handleExtensionRequest
} = require('../controllers/classController');
const authMiddleware = require('../middleware/auth');

router.get('/active', getActiveClasses);
router.get('/:classId/materials', authMiddleware, getClassMaterials);
router.get('/teacher/:teacherId', getClassesByTeacher);
router.post('/:classId/materials/:materialId/start', authMiddleware, startVideoAccess);
router.post('/:classId/materials/:materialId/extend', authMiddleware, requestVideoExtension);
router.get('/extension/requests', authMiddleware, getExtensionRequests);
router.post('/extension/handle', authMiddleware, handleExtensionRequest);

module.exports = router;


