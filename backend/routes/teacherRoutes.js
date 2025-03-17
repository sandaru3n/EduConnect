// backend/routes/teacherRoutes.js

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const Class = require("../models/Class");

const ClassMaterial = require("../models/ClassMaterial");
const multer = require("multer");

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/materials/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Upload class material
router.post(
    "/classes/:classId/materials",
    authMiddleware,
    upload.single("file"),
    async (req, res) => {
        try {
            const classItem = await Class.findById(req.params.classId);
            if (!classItem || classItem.teacherId.toString() !== req.user.id) {
                return res.status(403).json({ message: "Not authorized" });
            }

            const { title, type } = req.body;
            const content = type === "document" ? req.file.path : req.body.content;

            const material = new ClassMaterial({
                classId: req.params.classId,
                title,
                type,
                content,
                uploadedBy: req.user.id
            });

            const savedMaterial = await material.save();
            res.status(201).json(savedMaterial);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Error uploading material" });
        }
    }
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
            teacherId: req.user.id, // From authMiddleware
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

        // Check if the class belongs to the logged-in teacher
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

        // Check if the class belongs to the logged-in teacher
        if (classItem.teacherId.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to update this class" });
        }

        // Update fields
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

// Keep your sample route
router.get("/", (req, res) => {
    res.send("Teacher Route Working!");
});

module.exports = router;