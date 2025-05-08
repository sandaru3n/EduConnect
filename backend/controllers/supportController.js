const SupportCategory = require("../models/SupportCategory");
const SupportSubcategory = require("../models/SupportSubcategory");
const SupportTicket = require("../models/SupportTicket");
const FeeWaiver = require("../models/FeeWaiver");
const Class = require('../models/Class');
const User = require("../models/User");
const mongoose = require("mongoose");
const path = require("path"); // Ensure this import is present
const sendEmail = require("../config/email");

// Submit a support ticket (for any authenticated user)
exports.submitSupportTicket = async (req, res) => {
    try {
        const { categoryId, subcategoryId, message } = req.body;
        const userId = req.user.id;

        // Validate input
        if (!categoryId || !subcategoryId || !message) {
            return res.status(400).json({ message: "Category, subcategory, and message are required" });
        }

        // Fetch user to get email
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Validate category and subcategory
        const category = await SupportCategory.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        const subcategory = await SupportSubcategory.findOne({ _id: subcategoryId, categoryId });
        if (!subcategory) {
            return res.status(404).json({ message: "Subcategory not found or does not belong to the selected category" });
        }

        // Create support ticket (omit userRole since it's no longer required)
        const supportTicket = new SupportTicket({
            userId,
            email: user.email,
            categoryId,
            subcategoryId,
            message
        });
        await supportTicket.save();

        res.status(201).json({ message: "Support ticket submitted successfully", supportTicket });
    } catch (error) {
        console.error("Submit support ticket error:", error);
        res.status(500).json({ message: "Error submitting support ticket", error: error.message });
    }
};

// Fetch all categories (for form dropdown)
exports.getSupportCategories = async (req, res) => {
    try {
        const categories = await SupportCategory.find();
        res.status(200).json(categories);
    } catch (error) {
        console.error("Get support categories error:", error);
        res.status(500).json({ message: "Error retrieving support categories", error: error.message });
    }
};

// Fetch subcategories for a category (for form dropdown)
exports.getSupportSubcategories = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const subcategories = await SupportSubcategory.find({ categoryId });
        res.status(200).json(subcategories);
    } catch (error) {
        console.error("Get support subcategories error:", error);
        res.status(500).json({ message: "Error retrieving support subcategories", error: error.message });
    }
};

// Fetch all subcategories (for admin use)
exports.getAllSupportSubcategories = async (req, res) => {
    try {
        console.log("Fetching all support subcategories...");
        console.log("MongoDB connection state:", mongoose.connection.readyState);
        const subcategories = await SupportSubcategory.find();
        console.log("Subcategories fetched:", subcategories);
        res.status(200).json(subcategories);
    } catch (error) {
        console.error("Get all support subcategories error:", error);
        res.status(500).json({ message: "Error retrieving support subcategories", error: error.message });
    }
};

// Admin: Create a new category
exports.createSupportCategory = async (req, res) => {
    try {
        const { name } = req.body;

        // Validate input
        if (!name) {
            return res.status(400).json({ message: "Category name is required" });
        }

        // Create category
        const category = new SupportCategory({ name });
        await category.save();

        res.status(201).json({ message: "Support category created successfully", category });
    } catch (error) {
        console.error("Create support category error:", error);
        res.status(500).json({ message: "Error creating support category", error: error.message });
    }
};

// Admin: Create a new subcategory
exports.createSupportSubcategory = async (req, res) => {
    try {
        const { name, categoryId } = req.body;

        // Validate input
        if (!name || !categoryId) {
            return res.status(400).json({ message: "Subcategory name and category ID are required" });
        }

        // Validate category
        const category = await SupportCategory.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        // Create subcategory
        const subcategory = new SupportSubcategory({ name, categoryId });
        await subcategory.save();

        res.status(201).json({ message: "Support subcategory created successfully", subcategory });
    } catch (error) {
        console.error("Create support subcategory error:", error);
        res.status(500).json({ message: "Error creating support subcategory", error: error.message });
    }
};

// Admin: Delete a category
exports.deleteSupportCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        // Delete category and associated subcategories
        await SupportCategory.deleteOne({ _id: categoryId });
        await SupportSubcategory.deleteMany({ categoryId });

        res.status(200).json({ message: "Support category and its subcategories deleted successfully" });
    } catch (error) {
        console.error("Delete support category error:", error);
        res.status(500).json({ message: "Error deleting support category", error: error.message });
    }
};

// Admin: Delete a subcategory
exports.deleteSupportSubcategory = async (req, res) => {
    try {
        const { subcategoryId } = req.params;

        // Delete subcategory
        await SupportSubcategory.deleteOne({ _id: subcategoryId });

        res.status(200).json({ message: "Support subcategory deleted successfully" });
    } catch (error) {
        console.error("Delete support subcategory error:", error);
        res.status(500).json({ message: "Error deleting support subcategory", error: error.message });
    }
};

// Admin: Fetch all support tickets
// Fetch all support tickets (for any authenticated user)
exports.getAllSupportTickets = async (req, res) => {
    try {
        const tickets = await SupportTicket.find()
            .populate("userId", "name email")
            .populate("categoryId", "name")
            .populate("subcategoryId", "name")
            .sort({ createdAt: -1 });

        res.status(200).json(tickets);
    } catch (error) {
        console.error("Get all support tickets error:", error);
        res.status(500).json({ message: "Error retrieving support tickets", error: error.message });
    }
};

// Fetch a single support ticket (for any authenticated user)
exports.getSupportTicketById = async (req, res) => {
    try {
        const { ticketId } = req.params;

        const ticket = await SupportTicket.findById(ticketId)
            .populate("userId", "name email")
            .populate("categoryId", "name")
            .populate("subcategoryId", "name");

        if (!ticket) {
            return res.status(404).json({ message: "Support ticket not found" });
        }

        res.status(200).json(ticket);
    } catch (error) {
        console.error("Get support ticket by ID error:", error);
        res.status(500).json({ message: "Error retrieving support ticket", error: error.message });
    }
};

// Update support ticket status (for any authenticated user)
exports.updateSupportTicketStatus = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { status } = req.body;

        // Validate status
        if (!["Open", "Responded", "Closed"].includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const ticket = await SupportTicket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: "Support ticket not found" });
        }

        ticket.status = status;
        ticket.updatedAt = new Date();
        await ticket.save();

        res.status(200).json({ message: "Support ticket status updated successfully", ticket });
    } catch (error) {
        console.error("Update support ticket status error:", error);
        res.status(500).json({ message: "Error updating support ticket status", error: error.message });
    }
};

// Admin: Delete a support ticket
// Delete a support ticket (for any authenticated user)
exports.deleteSupportTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;

        const ticket = await SupportTicket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: "Support ticket not found" });
        }

        await SupportTicket.deleteOne({ _id: ticketId });

        res.status(200).json({ message: "Support ticket deleted successfully" });
    } catch (error) {
        console.error("Delete support ticket error:", error);
        res.status(500).json({ message: "Error deleting support ticket", error: error.message });
    }
};

// Fetch support tickets for the authenticated user
exports.getUserSupportTickets = async (req, res) => {
    try {
        const userId = req.user.id;

        const tickets = await SupportTicket.find({ userId })
            .populate("categoryId", "name")
            .populate("subcategoryId", "name")
            .sort({ createdAt: -1 });

        res.status(200).json(tickets);
    } catch (error) {
        console.error("Get user support tickets error:", error);
        res.status(500).json({ message: "Error retrieving support tickets", error: error.message });
    }
};

// Fetch a single support ticket for the authenticated user
exports.getUserSupportTicketById = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const userId = req.user.id;

        const ticket = await SupportTicket.findOne({ _id: ticketId, userId })
            .populate("categoryId", "name")
            .populate("subcategoryId", "name");

        if (!ticket) {
            return res.status(404).json({ message: "Support ticket not found or you do not have access to this ticket" });
        }

        res.status(200).json(ticket);
    } catch (error) {
        console.error("Get user support ticket by ID error:", error);
        res.status(500).json({ message: "Error retrieving support ticket", error: error.message });
    }
};

// Send a message within a support ticket (for any authenticated user)
exports.sendMessage = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role || "user"; // Fallback to "user" if role is undefined

        // Validate input
        if (!content) {
            return res.status(400).json({ message: "Message content is required" });
        }

        // Find the ticket
        const ticket = await SupportTicket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: "Support ticket not found" });
        }

        // Prevent replying to closed tickets
        if (ticket.status === "Closed") {
            return res.status(403).json({ message: "Cannot reply to a closed ticket" });
        }

        // Add the message to the ticket
        ticket.messages.push({
            senderId: userId,
            senderRole: userRole, // Use the fallback value
            content
        });

        // Update ticket status and timestamp
        ticket.status = "Responded"; // Standardize to "Responded" for all users
        ticket.updatedAt = new Date();
        await ticket.save();

        res.status(200).json({ message: "Message sent successfully", ticket });
    } catch (error) {
        console.error("Send message error:", error);
        res.status(500).json({ message: "Error sending message", error: error.message });
    }
};

exports.submitFeeWaiver = async (req, res) => {
    try {
        const { reason, classId } = req.body;
        const userId = req.user.id;
        const documentPath = req.file ? `/uploads/documents/${path.basename(req.file.path)}` : undefined;

        if (!reason || !classId) {
            return res.status(400).json({ message: "Reason and class selection are required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const classData = await Class.findById(classId);
        if (!classData) {
            return res.status(404).json({ message: "Class not found" });
        }

        const feeWaiver = new FeeWaiver({
            studentId: userId,
            classId,
            reason,
            documentPath
        });
        await feeWaiver.save();

        res.status(201).json({ message: "Fee waiver application submitted successfully", feeWaiver });
    } catch (error) {
        console.error("Submit fee waiver error:", error);
        res.status(500).json({ message: "Error submitting fee waiver application", error: error.message });
    }
};

// Fetch all fee waiver requests (for any authenticated user)
exports.getFeeWaiverRequests = async (req, res) => {
    try {
        const feeWaivers = await FeeWaiver.find()
            .populate("studentId", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json(feeWaivers);
    } catch (error) {
        console.error("Get fee waiver requests error:", error);
        res.status(500).json({ message: "Error retrieving fee waiver requests", error: error.message });
    }
};

// Update fee waiver request status
exports.updateFeeWaiverStatus = async (req, res) => {
    try {
        const { feeWaiverId } = req.params;
        const { status, teacherComments, discountPercentage } = req.body;
        const teacherId = req.user.id;

        if (!["Approved", "Rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid status value. Must be 'Approved' or 'Rejected'" });
        }

        if (status === "Approved" && (!discountPercentage || discountPercentage < 0 || discountPercentage > 100)) {
            return res.status(400).json({ message: "Discount percentage must be between 0 and 100 when approving" });
        }

        const feeWaiver = await FeeWaiver.findById(feeWaiverId).populate("classId");
        if (!feeWaiver) {
            return res.status(404).json({ message: "Fee waiver request not found" });
        }

        // Ensure the teacher is the owner of the class
        if (feeWaiver.classId.teacherId.toString() !== teacherId) {
            return res.status(403).json({ message: "You are not authorized to review this fee waiver request" });
        }

        if (feeWaiver.status !== "Pending") {
            return res.status(400).json({ message: "This fee waiver request has already been processed" });
        }

        feeWaiver.status = status;
        feeWaiver.teacherComments = teacherComments || "";
        if (status === "Approved") {
            feeWaiver.discountPercentage = discountPercentage || 0;
        }
        feeWaiver.updatedAt = new Date();
        await feeWaiver.save();

        // Notify the student via email
        const student = await User.findById(feeWaiver.studentId);
        if (student) {
            const subject = `Fee Waiver Request ${status}`;
            const text = `Hello ${student.name},\n\nYour fee waiver request for the class "${feeWaiver.classId.subject}" has been ${status.toLowerCase()}.\n${
                status === "Approved" ? `You have been granted a ${feeWaiver.discountPercentage}% discount on the class fee.` : ""
            }${teacherComments ? `\nTeacher Comments: ${teacherComments}` : ""}\n\nEduConnect Team`;
            const html = `<h2>Fee Waiver Request ${status}</h2><p>Hello ${student.name},</p><p>Your fee waiver request for the class "<strong>${feeWaiver.classId.subject}</strong>" has been <strong>${status.toLowerCase()}</strong>.</p>${
                status === "Approved" ? `<p>You have been granted a <strong>${feeWaiver.discountPercentage}%</strong> discount on the class fee.</p>` : ""
            }${teacherComments ? `<p><strong>Teacher Comments:</strong> ${teacherComments}</p>` : ""}<p>EduConnect Team</p>`;
            await sendEmail(student.email, subject, text, html);
        }

        res.status(200).json({ message: "Fee waiver request updated successfully", feeWaiver });
    } catch (error) {
        console.error("Update fee waiver status error:", error);
        res.status(500).json({ message: "Error updating fee waiver status", error: error.message });
    }
};

// Get fee waiver history for the logged-in student
exports.getFeeWaiverHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user || user.role !== "student") {
            return res.status(403).json({ message: "Only students can access fee waiver history" });
        }

        const feeWaivers = await FeeWaiver.find({ studentId: userId })
            .populate("classId", "subject monthlyFee")
            .select("classId reason documentPath status discountPercentage teacherComments createdAt updatedAt")
            .sort({ createdAt: -1 });

        res.status(200).json(feeWaivers);
    } catch (error) {
        console.error("Get fee waiver history error:", error);
        res.status(500).json({ message: "Error fetching fee waiver history", error: error.message });
    }
};

// Fetch all classes for the student (subscribed or not)
exports.getStudentClasses = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user || user.role !== "student") {
            return res.status(403).json({ message: "Only students can access class list" });
        }

        const classes = await Class.find({ isActive: true })
            .select("subject teacherId monthlyFee")
            .populate("teacherId", "name");

        res.status(200).json(classes);
    } catch (error) {
        console.error("Get student classes error:", error);
        res.status(500).json({ message: "Error fetching classes", error: error.message });
    }
};

// Fetch fee waiver requests for the logged-in teacher's classes
exports.getFeeWaiverRequestsForTeacher = async (req, res) => {
    try {
        const teacherId = req.user.id;
        const user = await User.findById(teacherId);
        if (!user || !["teacher", "institute"].includes(user.role)) {
            return res.status(403).json({ message: "Only teachers and institutes can access fee waiver requests" });
        }

        // Fetch classes owned by the teacher
        const teacherClasses = await Class.find({ teacherId }).select("_id");
        const classIds = teacherClasses.map(cls => cls._id);

        // Fetch fee waiver requests for those classes
        const feeWaivers = await FeeWaiver.find({ classId: { $in: classIds } })
            .populate("studentId", "name email")
            .populate("classId", "subject monthlyFee")
            .sort({ createdAt: -1 });

        res.status(200).json(feeWaivers);
    } catch (error) {
        console.error("Get fee waiver requests for teacher error:", error);
        res.status(500).json({ message: "Error retrieving fee waiver requests", error: error.message });
    }
};


module.exports = exports;