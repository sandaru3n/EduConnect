const express = require("express");
const router = express.Router();
const { generateMCQs, attemptQuiz, getQuizResults, getQuizById, getAvailableQuizzes, getTeacherClasses } = require("../controllers/quizController");
const authMiddleware = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "../src/public/uploads/doubts");
        console.log("Multer saving to:", uploadPath);
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const filename = `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`;
        console.log("Multer filename:", filename);
        cb(null, filename);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPEG, PNG, or PDF files are allowed"), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 100 * 1024 * 1024 }
});

// Generate MCQs (Teacher)
router.post("/generate", authMiddleware, upload.fields([{ name: "file", maxCount: 1 }]), generateMCQs);

// Attempt quiz (Student)
router.post("/attempt", authMiddleware, attemptQuiz);

// Get quiz results (Student)
router.get("/results/:quizId", authMiddleware, getQuizResults);

// Get quiz by ID (Student)
router.get("/:quizId", authMiddleware, getQuizById);

// Get available quizzes (Student)
router.get("/student/available", authMiddleware, getAvailableQuizzes);

// Get teacher classes (Teacher)
router.get("/teacher/classes", authMiddleware, getTeacherClasses);

module.exports = router;