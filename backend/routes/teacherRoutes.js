// backend/routes/teacherRoutes.js

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const Class = require("../models/Class");
const { uploadMaterial } = require("../controllers/classController");
const ClassMaterial = require("../models/ClassMaterial");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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


// Fetch all materials for the teacher's classes
router.get("/materials", authMiddleware, async (req, res) => {
    try {
        const classes = await Class.find({ teacherId: req.user.id });
        const classIds = classes.map(cls => cls._id);
        const materials = await ClassMaterial.find({ classId: { $in: classIds } })
            .populate('classId', 'subject');
        res.status(200).json(materials);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching materials" });
    }
});

// Update a material
router.put("/materials/:materialId", authMiddleware, upload.fields([{ name: 'file', maxCount: 1 }]), async (req, res) => {
    try {
        const { materialId } = req.params;
        const { title, lessonName, type, uploadDate, classId } = req.body;
        const userId = req.user.id;

        const material = await ClassMaterial.findById(materialId);
        if (!material) {
            return res.status(404).json({ message: "Material not found" });
        }

        const classItem = await Class.findById(classId);
        if (!classItem || classItem.teacherId.toString() !== userId) {
            return res.status(403).json({ message: "Not authorized" });
        }

        if (!title || !lessonName || !type || !uploadDate) {
            return res.status(400).json({ message: "Title, lesson name, type, and upload date are required" });
        }

        if (!['pdf', 'video', 'link'].includes(type)) {
            return res.status(400).json({ message: "Invalid material type" });
        }

        let content = req.body.content;
        if (type === 'link') {
            if (!content) {
                return res.status(400).json({ message: "URL is required for link type" });
            }
        } else if (req.files && req.files.file) {
            // Delete the old file if it exists
            if (material.content && material.content.startsWith('/uploads/materials')) {
                const oldFilePath = path.join(__dirname, '../src/public', material.content);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }
            content = `/uploads/materials/${req.files.file[0].filename}`;
        }

        material.title = title;
        material.lessonName = lessonName;
        material.type = type;
        material.content = content || material.content;
        material.uploadDate = new Date(uploadDate);
        material.classId = classId;

        await material.save();
        res.status(200).json(material);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating material", error: error.message });
    }
});

// Delete a material
router.delete("/materials/:materialId", authMiddleware, async (req, res) => {
    try {
        const { materialId } = req.params;
        const userId = req.user.id;

        const material = await ClassMaterial.findById(materialId);
        if (!material) {
            return res.status(404).json({ message: "Material not found" });
        }

        const classItem = await Class.findById(material.classId);
        if (!classItem || classItem.teacherId.toString() !== userId) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // Delete the file if it exists
        if (material.content && material.content.startsWith('/uploads/materials')) {
            const filePath = path.join(__dirname, '../src/public', material.content);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await ClassMaterial.deleteOne({ _id: materialId });
        res.status(200).json({ message: "Material deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting material", error: error.message });
    }
});

// Sample route
router.get("/", (req, res) => {
    res.send("Teacher Route Working!");
});

module.exports = router;