// backend/routes/teacherRoutes.js

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const Class = require("../models/Class");
const { uploadMaterial } = require("../controllers/classController");
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "src/public/uploads/materials");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'video/mp4'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF and MP4 files are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Upload class material
router.post(
    "/classes/:classId/materials",
    authMiddleware,
    upload.fields([{ name: 'file', maxCount: 1 }]),
    uploadMaterial
);

// Create a new class
router.post("/classes", authMiddleware, async (req, res) => {
    try {
        const { subject, monthlyFee, description } = req.body;
        
        // Validate required fields
        if (!subject || !monthlyFee) {
            return res.status(400).json({ message: "Subject and monthly fee are required" });
        }

        const classData = new Class({
            subject,
            monthlyFee,
            description,
            teacherId: req.user.id,
            isActive: true
        });

        const createdClass = await classData.save();
        
        res.status(201).json({
            _id: createdClass._id,
            subject: createdClass.subject,
            monthlyFee: createdClass.monthlyFee,
            description: createdClass.description,
            teacherId: createdClass.teacherId,
            isActive: createdClass.isActive
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while creating class" });
    }
});

// Get all classes for logged-in teacher
router.get("/classes", authMiddleware, async (req, res) => {
    try {
        const classes = await Class.find({ teacherId: req.user.id });
        
        res.json(classes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error while fetching classes" });
    }
});

// Get single class
router.get("/classes/:classId", authMiddleware, async (req, res) => {
    try {
        const classItem = await Class.findById(req.params.classId);
        
        if (!classItem) {
            return res.status(404).json({ message: "Class not found" });
        }

        if (classItem.teacherId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to view this class" });
        }

        res.json(classItem);
    } catch (error) {
        console.error(error);
        if (error.kind === "ObjectId") {
            return res.status(400).json({ message: "Invalid class ID" });
        }
        res.status(500).json({ message: "Server error while fetching class" });
    }
});

// Update class
router.put("/classes/:classId", authMiddleware, async (req, res) => {
    try {
        const { subject, monthlyFee, description, isActive } = req.body;
        
        const classItem = await Class.findById(req.params.classId);
        
        if (!classItem) {
            return res.status(404).json({ message: "Class not found" });
        }

        if (classItem.teacherId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to update this class" });
        }

        classItem.subject = subject || classItem.subject;
        classItem.monthlyFee = monthlyFee || classItem.monthlyFee;
        classItem.description = description || classItem.description;
        classItem.isActive = isActive !== undefined ? isActive : classItem.isActive;

        const updatedClass = await classItem.save();
        
        res.json({
            _id: updatedClass._id,
            subject: updatedClass.subject,
            monthlyFee: updatedClass.monthlyFee,
            description: updatedClass.description,
            isActive: updatedClass.isActive
        });
    } catch (error) {
        console.error(error);
        if (error.kind === "ObjectId") {
            return res.status(400).json({ message: "Invalid class ID" });
        }
        res.status(500).json({ message: "Server error while updating class" });
    }
});

// Sample route
router.get("/", (req, res) => {
    res.send("Teacher Route Working!");
});

module.exports = router;