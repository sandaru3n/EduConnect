// backend/routes/authRoutes.js

const express = require("express");
const { register, login, updateProfile, getProfile,requestPasswordReset,verifyResetCode,resetPassword,createNotice,
    getTeacherNotices,
    updateNotice,
    deleteNotice,
    getStudentNotices,
    markNoticeAsRead,
    getNoticeById } = require("../controllers/authController");
const router = express.Router();

const authMiddleware = require("../middleware/auth");
const multer = require("multer");
const path = require("path");


// Configure multer for profile picture uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "src/public/uploads/profiles");
    },
    filename: (req, file, cb) => {
        cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPG and PNG files are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post("/register", register);
router.post("/login", login);
router.put("/profile", authMiddleware, upload.fields([{ name: 'profilePicture', maxCount: 1 }]), updateProfile);
router.get("/profile", authMiddleware, getProfile);


// Forgot Password Routes
router.post("/forgot-password", requestPasswordReset);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);


// Notice Routes
router.post("/notices", authMiddleware, createNotice);
router.get("/notices/teacher", authMiddleware, getTeacherNotices);
router.put("/notices", authMiddleware, updateNotice);
router.delete("/notices/:noticeId", authMiddleware, deleteNotice);
router.get("/notices/student", authMiddleware, getStudentNotices);
router.post("/notices/:noticeId/read", authMiddleware, markNoticeAsRead);
router.get("/notices/:noticeId", authMiddleware, getNoticeById);


module.exports = router;
