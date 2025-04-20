//backend/controllers/classController.js
const Class = require('../models/Class');
const ClassMaterial = require('../models/ClassMaterial');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const sendEmail = require('../config/email');

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

        const classItem = await Class.findById(classId);
        if (!classItem || classItem.teacherId.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (!title || !lessonName || !type || !uploadDate) {
            return res.status(400).json({ message: 'Title, lesson name, type, and upload date are required' });
        }

        if (!['pdf', 'video', 'link'].includes(type)) {
            return res.status(400).json({ message: 'Invalid material type' });
        }

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

        if (!material.accessStartTime || material.extensionApproved) {
            material.accessStartTime = new Date();
            if (material.extensionApproved) {
                material.extensionApproved = false;
            }
            await material.save();
            res.status(200).json({ 
                message: 'Video access started',
                isExtended: material.extensionApproved
            });
        } else {
            return res.status(400).json({ message: 'Video access already started' });
        }
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

        // Check existing requests for the student
        const studentRequests = material.extendRequests.filter(
            r => r.studentId.toString() === req.user.id
        );
        if (studentRequests.length >= 2) {
            return res.status(400).json({ message: 'You have reached the maximum of 2 extension requests for this video' });
        }

        const existingPending = studentRequests.find(r => r.status === 'pending');
        if (existingPending) {
            return res.status(400).json({ message: 'You already have a pending extension request' });
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

exports.getExtensionRequests = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const classes = await Class.find({ teacherId }).select('_id');
        const classIds = classes.map(c => c._id);

        const materials = await ClassMaterial.find({
            classId: { $in: classIds },
            extendRequests: { $exists: true, $ne: [] }
        })
            .populate('classId', 'subject')
            .populate('extendRequests.studentId', 'name email');

        const requests = materials.flatMap(material =>
            material.extendRequests.map(req => ({
                requestId: req._id,
                materialId: material._id,
                classId: material.classId._id,
                classSubject: material.classId.subject,
                lessonName: material.lessonName,
                studentName: req.studentId.name,
                studentEmail: req.studentId.email,
                reason: req.reason,
                status: req.status,
                requestedAt: req.requestedAt
            }))
        );

        res.status(200).json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching extension requests' });
    }
};

exports.handleExtensionRequest = async (req, res) => {
    try {
        const { materialId, requestId, status } = req.body;
        const material = await ClassMaterial.findById(materialId);
        if (!material || material.type !== 'video') {
            return res.status(404).json({ message: 'Video material not found' });
        }

        const classItem = await Class.findById(material.classId);
        if (!classItem || classItem.teacherId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const extendRequest = material.extendRequests.id(requestId);
        if (!extendRequest) {
            return res.status(404).json({ message: 'Extension request not found' });
        }

        extendRequest.status = status;
        if (status === 'approved') {
            material.extensionApproved = true;
            material.accessStartTime = null;
        }

        // Send email notification
        const student = await User.findById(extendRequest.studentId);
        if (student) {
            const subject = `Video Extension Request ${status.charAt(0).toUpperCase() + status.slice(1)}`;
            const text = `Your request to extend access to "${material.lessonName}" has been ${status}. ${
                status === 'approved' ? 'You now have 6 hours of access when you start the video.' : 'Please contact your teacher for further assistance.'
            }`;
            const html = `
                <h2>${subject}</h2>
                <p>Your request to extend access to "<strong>${material.lessonName}</strong>" has been <strong>${status}</strong>.</p>
                ${
                    status === 'approved'
                        ? '<p>You now have 6 hours of access when you start the video.</p>'
                        : '<p>Please contact your teacher for further assistance.</p>'
                }
                <p>EduConnect Team</p>
            `;
            await sendEmail(student.email, subject, text, html);
        }

        await material.save();
        res.status(200).json({ message: `Extension request ${status}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error handling extension request' });
    }
};

module.exports = exports;