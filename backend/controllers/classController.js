//backend/controllers/classController.js
const mongoose = require("mongoose"); // Add this import
const Class = require('../models/Class');
const ClassMaterial = require('../models/ClassMaterial');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const sendEmail = require('../config/email');

// Create a new class (for teachers)
exports.createClass = async (req, res) => {
    try {
        const { subject, monthlyFee, description } = req.body;
        const teacherId = req.user.id;

        // Validate input
        if (!subject || !monthlyFee) {
            return res.status(400).json({ message: "Subject and monthly fee are required" });
        }

        // Validate monthly fee as a positive number
        const fee = Number(monthlyFee);
        if (isNaN(fee) || fee <= 0) {
            return res.status(400).json({ message: "Monthly fee must be a positive number" });
        }

        // Validate teacher role
        const user = await User.findById(teacherId);
        if (!user || user.role !== "teacher") {
            return res.status(403).json({ message: "Only teachers can create classes" });
        }

        // Handle cover photo upload
        let coverPhotoPath = null;
        if (req.files && req.files.coverPhoto) {
            const coverPhoto = req.files.coverPhoto[0];
            const allowedTypes = ['image/jpeg', 'image/png'];
            if (!allowedTypes.includes(coverPhoto.mimetype)) {
                return res.status(400).json({ message: "Cover photo must be a JPEG or PNG file" });
            }
            coverPhotoPath = `/uploads/cover-photos/${coverPhoto.filename}`;
        }

        // Create the class
        const newClass = new Class({
            subject,
            monthlyFee: fee,
            description,
            teacherId,
            coverPhoto: coverPhotoPath,
            isActive: true
        });
        await newClass.save();

        // Send email notification to the teacher
        const subjectLine = "New Class Created Successfully";
        const text = `Hello ${user.name},\n\nYour class "${subject}" has been created successfully. Monthly Fee: LKR ${monthlyFee}.\n\nEduConnect Team`;
        const html = `
            <h2>New Class Created</h2>
            <p>Hello ${user.name},</p>
            <p>Your class "<strong>${subject}</strong>" has been created successfully.</p>
            <p>Monthly Fee: <strong>LKR ${monthlyFee}</strong></p>
            <p>EduConnect Team</p>
        `;
        await sendEmail(user.email, subjectLine, text, html);

        res.status(201).json({ message: "Class created successfully", class: newClass });
    } catch (error) {
        console.error("Create class error:", error);
        res.status(500).json({ message: "Error creating class", error: error.message });
    }
};

// Delete a class (for teachers)
exports.deleteClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const teacherId = req.user.id;

        // Validate class ID
        if (!mongoose.Types.ObjectId.isValid(classId)) {
            return res.status(400).json({ message: "Invalid class ID" });
        }

        // Find the class and ensure it belongs to the teacher
        const classItem = await Class.findById(classId);
        if (!classItem) {
            return res.status(404).json({ message: "Class not found" });
        }
        if (classItem.teacherId.toString() !== teacherId) {
            return res.status(403).json({ message: "Not authorized to delete this class" });
        }

        // Validate teacher role
        const user = await User.findById(teacherId);
        if (!user || user.role !== "teacher") {
            return res.status(403).json({ message: "Only teachers can delete classes" });
        }

        // Delete the cover photo if it exists
        if (classItem.coverPhoto) {
            const photoPath = path.join(__dirname, '../src/public', classItem.coverPhoto);
            if (fs.existsSync(photoPath)) {
                fs.unlinkSync(photoPath);
            }
        }

        // Delete the class
        await Class.deleteOne({ _id: classId });

        // Send email notification to the teacher
        const subjectLine = "Class Deleted Successfully";
        const text = `Hello ${user.name},\n\nYour class "${classItem.subject}" has been deleted successfully.\n\nEduConnect Team`;
        const html = `
            <h2>Class Deleted</h2>
            <p>Hello ${user.name},</p>
            <p>Your class "<strong>${classItem.subject}</strong>" has been deleted successfully.</p>
            <p>EduConnect Team</p>
        `;
        await sendEmail(user.email, subjectLine, text, html);

        res.status(200).json({ message: "Class deleted successfully" });
    } catch (error) {
        console.error("Delete class error:", error);
        res.status(500).json({ message: "Error deleting class", error: error.message });
    }
};

// Update an existing class (for teachers)
exports.updateClass = async (req, res) => {
    try {
        const { classId } = req.params;
        const { subject, monthlyFee, description } = req.body;
        const teacherId = req.user.id;

        // Validate class ID
        if (!mongoose.Types.ObjectId.isValid(classId)) {
            return res.status(400).json({ message: "Invalid class ID" });
        }

        // Find the class and ensure it belongs to the teacher
        const classItem = await Class.findById(classId);
        if (!classItem) {
            return res.status(404).json({ message: "Class not found" });
        }
        if (classItem.teacherId.toString() !== teacherId) {
            return res.status(403).json({ message: "Not authorized to update this class" });
        }

        // Validate teacher role
        const user = await User.findById(teacherId);
        if (!user || user.role !== "teacher") {
            return res.status(403).json({ message: "Only teachers can update classes" });
        }

        // Update fields if provided
        if (subject) {
            if (!subject.trim() || subject.length < 2 || subject.length > 50) {
                return res.status(400).json({ message: "Subject must be between 2 and 50 characters" });
            }
            classItem.subject = subject;
        }

        if (monthlyFee) {
            const fee = Number(monthlyFee);
            if (isNaN(fee) || fee <= 0) {
                return res.status(400).json({ message: "Monthly fee must be a positive number" });
            }
            if (fee > 10000) {
                return res.status(400).json({ message: "Monthly fee cannot exceed LKR 10,000" });
            }
            classItem.monthlyFee = fee;
        }

        if (description) {
            if (description.length > 500) {
                return res.status(400).json({ message: "Description must be less than 500 characters" });
            }
            classItem.description = description;
        }

        // Handle cover photo update
        if (req.files && req.files.coverPhoto) {
            const coverPhoto = req.files.coverPhoto[0];
            const allowedTypes = ['image/jpeg', 'image/png'];
            if (!allowedTypes.includes(coverPhoto.mimetype)) {
                return res.status(400).json({ message: "Cover photo must be a JPEG or PNG file" });
            }

            // Delete the old cover photo if it exists
            if (classItem.coverPhoto) {
                const oldPhotoPath = path.join(__dirname, '../src/public', classItem.coverPhoto);
                if (fs.existsSync(oldPhotoPath)) {
                    fs.unlinkSync(oldPhotoPath);
                }
            }

            // Set the new cover photo path
            classItem.coverPhoto = `/uploads/cover-photos/${coverPhoto.filename}`;
        }

        // Save the updated class to the database
        await classItem.save();

        // Send email notification to the teacher
        const subjectLine = "Class Updated Successfully";
        const text = `Hello ${user.name},\n\nYour class "${classItem.subject}" has been updated successfully. Monthly Fee: LKR ${classItem.monthlyFee}.\n\nEduConnect Team`;
        const html = `
            <h2>Class Updated</h2>
            <p>Hello ${user.name},</p>
            <p>Your class "<strong>${classItem.subject}</strong>" has been updated successfully.</p>
            <p>Monthly Fee: <strong>LKR ${classItem.monthlyFee}</strong></p>
            <p>EduConnect Team</p>
        `;
        await sendEmail(user.email, subjectLine, text, html);

        res.status(200).json({ message: "Class updated successfully", class: classItem });
    } catch (error) {
        console.error("Update class error:", error);
        res.status(500).json({ message: "Error updating class", error: error.message });
    }
};

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

exports.getTeacherClassesForDashboard = async (req, res) => {
    try {
        const teacherId = req.user.id; // Use authenticated user ID
        const classes = await Class.find({ teacherId, isActive: true })
            .select('subject monthlyFee description')
            .sort('subject');
        res.status(200).json(classes);
    } catch (error) {
        console.error("Error fetching teacher's classes for dashboard:", error);
        res.status(500).json({ message: 'Server error fetching classes for dashboard' });
    }
};

module.exports = exports;