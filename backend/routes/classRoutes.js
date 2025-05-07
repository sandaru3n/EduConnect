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
    handleExtensionRequest,
    createClass,
    updateClass,getTeacherClassesForDashboard,
    deleteClass // Add the new method
} = require('../controllers/classController');
const authMiddleware = require('../middleware/auth');

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for file uploads (materials)
const materialStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "../src/public/uploads/materials");
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const filename = `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, filename);
    }
});

// Configure multer for cover photo uploads
const coverPhotoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "../src/public/uploads/cover-photos");
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const filename = `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, filename);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf", "video/mp4"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPEG, PNG, PDF, or MP4 files are allowed"), false);
    }
};

const coverPhotoFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPEG and PNG files are allowed for cover photos"), false);
    }
};

const materialUpload = multer({
    storage: materialStorage,
    fileFilter,
    limits: { fileSize: 100 * 1024 * 1024 }
});

const coverPhotoUpload = multer({
    storage: coverPhotoStorage,
    fileFilter: coverPhotoFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit for cover photos
});

router.get('/active', getActiveClasses);
router.get('/:classId/materials', authMiddleware, getClassMaterials);
router.get('/teacher/:teacherId', getClassesByTeacher);
router.post('/:classId/materials/:materialId/start', authMiddleware, startVideoAccess);
router.post('/:classId/materials/:materialId/extend', authMiddleware, requestVideoExtension);
router.get('/extension/requests', authMiddleware, getExtensionRequests);
router.post('/extension/handle', authMiddleware, handleExtensionRequest);

// Create a new class (Teacher)
router.post("/create", authMiddleware, coverPhotoUpload.fields([{ name: "coverPhoto", maxCount: 1 }]), createClass);

// Update an existing class (Teacher)
router.put("/:classId", authMiddleware, coverPhotoUpload.fields([{ name: "coverPhoto", maxCount: 1 }]), updateClass);

// Delete a class (Teacher)
router.delete("/:classId", authMiddleware, deleteClass);

router.get('/teacher-classes-dashboard', authMiddleware, getTeacherClassesForDashboard);

module.exports = router;


