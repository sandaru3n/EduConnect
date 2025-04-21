const express = require("express");
const router = express.Router();
const { resolveDoubt } = require("../controllers/doubtController");
const authMiddleware = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "../src/public/uploads/doubts");
        console.log("Multer saving to:", uploadPath); // Debug log
        // Ensure directory exists
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const filename = `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`;
        console.log("Multer filename:", filename); // Debug log
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
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Resolve doubt
router.post(
    "/resolve",
    authMiddleware,
    upload.fields([{ name: "file", maxCount: 1 }]),
    resolveDoubt
);

module.exports = router;