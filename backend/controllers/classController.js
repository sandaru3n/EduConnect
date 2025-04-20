//backend/controllers/classController.js
const Class = require('../models/Class');
const ClassMaterial = require('../models/ClassMaterial');
const path = require('path');
const fs = require('fs');

exports.getActiveClasses = async (req, res) => {
    try {
        const classes = await Class.find({ isActive: true }).populate('teacherId', 'name');
        res.status(200).json(classes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching active classes' });
    }
};

exports.getClassMaterials = async (req, res) => {
    try {
        const materials = await ClassMaterial.find({ classId: req.params.classId });
        res.status(200).json(materials);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching class materials' });
    }
};

exports.getClassesByTeacher = async (req, res) => {
    try {
        const teacherId = req.params.teacherId;
        const classes = await Class.find({ teacherId, isActive: true })
            .select('subject monthlyFee description')
            .sort('subject');
        res.status(200).json(classes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching classes' });
    }
};

exports.uploadMaterial = async (req, res) => {
    try {
        const { title, lessonName, type, uploadDate } = req.body;
        const classId = req.params.classId;
        const userId = req.user.id;

        // Validate class and teacher authorization
        const classItem = await Class.findById(classId);
        if (!classItem || classItem.teacherId.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Validate required fields
        if (!title || !lessonName || !type || !uploadDate) {
            return res.status(400).json({ message: 'Title, lesson name, type, and upload date are required' });
        }

        // Validate type
        if (!['pdf', 'video', 'link'].includes(type)) {
            return res.status(400).json({ message: 'Invalid material type' });
        }

        // Validate file or content based on type
        let content;
        if (type === 'link') {
            if (!req.body.content) {
                return res.status(400).json({ message: 'URL is required for link type' });
            }
            content = req.body.content;
        } else {
            if (!req.files || !req.files.file) {
                return res.status(400).json({ message: 'File is required for pdf or video type' });
            }
            content = `/uploads/materials/${req.files.file[0].filename}`;
        }

        const material = new ClassMaterial({
            classId,
            title,
            lessonName,
            type,
            content,
            uploadDate: new Date(uploadDate),
            uploadedBy: userId
        });

        await material.save();
        res.status(201).json({ message: 'Material uploaded successfully', material });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Error uploading material', error: error.message });
    }
};

exports.startVideoAccess = async (req, res) => {
    try {
        const material = await ClassMaterial.findById(req.params.materialId);
        if (!material || material.type !== 'video') {
            return res.status(404).json({ message: 'Video material not found' });
        }
        if (material.accessStartTime) {
            return res.status(400).json({ message: 'Video access already started' });
        }

        material.accessStartTime = new Date();
        await material.save();
        res.status(200).json({ message: 'Video access started' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error starting video access' });
    }
};

exports.requestVideoExtension = async (req, res) => {
    try {
        const { reason } = req.body;
        const material = await ClassMaterial.findById(req.params.materialId);
        if (!material || material.type !== 'video') {
            return res.status(404).json({ message: 'Video material not found' });
        }

        material.extendRequests.push({
            studentId: req.user.id,
            reason,
            status: 'pending'
        });
        await material.save();
        res.status(201).json({ message: 'Extension request submitted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error submitting extension request' });
    }
};

exports.handleExtensionRequest = async (req, res) => {
    try {
        const { materialId, requestId, status } = req.body;
        const material = await ClassMaterial.findById(materialId);
        if (!material || material.type !== 'video') {
            return res.status(404).json({ message: 'Video material not found' });
        }

        const extendRequest = material.extendRequests.id(requestId);
        if (!extendRequest) {
            return res.status(404).json({ message: 'Extension request not found' });
        }

        extendRequest.status = status;
        if (status === 'approved') {
            const now = new Date();
            material.accessStartTime = new Date(now.getTime() - 18 * 60 * 60 * 1000);
        }
        await material.save();
        res.status(200).json({ message: `Extension request ${status}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error handling extension request' });
    }
};

module.exports = exports;