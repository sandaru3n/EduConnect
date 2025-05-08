//backend/controllers/authController.js
const User = require("../models/User");
const generateToken = require("../config/jwt");

const Notice = require("../models/Notice");
const Class = require("../models/Class");
const Subscription = require("../models/Subscription"); // Added for teacher account limit
const StudentSubscription = require("../models/StudentSubscription");
const TeacherInstituteNotice = require("../models/TeacherInstituteNotice")

const PasswordResetToken = require("../models/PasswordResetToken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");


// Configure Nodemailer (replace with your email service credentials)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, // Your email address (set in .env)
        pass: process.env.EMAIL_PASS, // Your email password or app-specific password (set in .env)
    },
});

exports.register = async (req, res) => {
    const { 
        name, email, password, role, 
        firstName, lastName, contactNumber, dateOfBirth, 
        guardianName, guardianContactNumber,addressLine1,addressLine2,district,zipCode, address, username,age,subscriptionId
    } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const userData = {
        name: name || `${firstName} ${lastName}`, // Use full name for non-students or combine first/last for students
        email,
        password,
        role,
    };

    // Add student-specific fields if role is student
    if (role === "student") {
        userData.firstName = firstName;
        userData.lastName = lastName;
        userData.contactNumber = contactNumber;
        userData.dateOfBirth = dateOfBirth;
        userData.guardianName = guardianName;
        userData.guardianContactNumber = guardianContactNumber;
        userData.addressLine1 = addressLine1;
        userData.addressLine2 = addressLine2;
        userData.district = district;
        userData.zipCode = zipCode;
        userData.address = address;
        userData.username = username;
    }
    else if (role === "teacher") {
    userData.age = age;
    userData.contactNumber = contactNumber; // New field
    userData.addressLine1 = addressLine1; // New field
    userData.addressLine2 = addressLine2; // New field
    userData.district = district; // New field
    userData.zipCode = zipCode; // New field
    if (!subscriptionId) return res.status(400).json({ message: "Subscription plan is required for teachers" });
    userData.subscriptionId = subscriptionId;
    } else if (role === "institute") {
    userData.contactNumber = contactNumber; // New field
    userData.addressLine1 = addressLine1; // New field
    userData.addressLine2 = addressLine2; // New field
    userData.district = district; // New field
    userData.zipCode = zipCode; // New field
    if (!subscriptionId) return res.status(400).json({ message: "Subscription plan is required for institutes" });
    userData.subscriptionId = subscriptionId;
    }

    const user = await User.create(userData);
    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            subscriptionId: user.subscriptionId,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: "Invalid user data" });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    if (["teacher", "institute"].includes(user.role) && user.subscriptionStatus !== "active") {
        return res.status(403).json({ message: "Your subscription is not active." });
    }

    res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
    });
};


exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const { 
            name, email, 
            firstName, lastName, contactNumber, dateOfBirth, 
            guardianName, guardianContactNumber, addressLine1, addressLine2, district, zipCode, username, age 
        } = req.body;

        // Validate email uniqueness
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: "Email already in use" });
            }
            user.email = email;
        }

        // Update common fields
        user.name = name || user.name;

        // Update role-specific fields
        if (user.role === "student") {
            user.firstName = firstName || user.firstName;
            user.lastName = lastName || user.lastName;
            user.contactNumber = contactNumber || user.contactNumber;
            user.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : user.dateOfBirth;
            user.guardianName = guardianName || user.guardianName;
            user.guardianContactNumber = guardianContactNumber || user.guardianContactNumber;
            user.addressLine1 = addressLine1 || user.addressLine1;
            user.addressLine2 = addressLine2 || user.addressLine2;
            user.district = district || user.district;
            user.zipCode = zipCode || user.zipCode;
            user.username = username || user.username;
        } else if (user.role === "teacher") {
            user.age = age || user.age;
        }

        // Handle profile picture upload
        if (req.files && req.files.profilePicture) {
            user.profilePicture = `/uploads/profiles/${req.files.profilePicture[0].filename}`;
        }

        await user.save();
        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
                firstName: user.firstName,
                lastName: user.lastName,
                contactNumber: user.contactNumber,
                dateOfBirth: user.dateOfBirth,
                guardianName: user.guardianName,
                guardianContactNumber: user.guardianContactNumber,
                addressLine1: user.addressLine1,
                addressLine2: user.addressLine2,
                district: user.district,
                zipCode: user.zipCode,
                username: user.username,
                age: user.age
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profilePicture: user.profilePicture,
            firstName: user.firstName,
            lastName: user.lastName,
            contactNumber: user.contactNumber,
            dateOfBirth: user.dateOfBirth,
            guardianName: user.guardianName,
            guardianContactNumber: user.guardianContactNumber,
            addressLine1: user.addressLine1,
            addressLine2: user.addressLine2,
            district: user.district,
            zipCode: user.zipCode,
            username: user.username,
            age: user.age
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
};


exports.requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User with this email does not exist" });
        }

        // Generate a 6-digit code
        const code = crypto.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiration

        // Save the reset token
        await PasswordResetToken.deleteMany({ userId: user._id }); // Remove any existing tokens
        const resetToken = new PasswordResetToken({
            userId: user._id,
            token: code,
            expiresAt
        });
        await resetToken.save();

        // Send email with the code
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset Code - EduConnect",
            text: `Your password reset code is: ${code}\nThis code will expire in 10 minutes.`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Password reset code sent to your email" });
    } catch (error) {
        console.error("Request password reset error:", error);
        res.status(500).json({ message: "Error sending reset code", error: error.message });
    }
};

exports.verifyResetCode = async (req, res) => {
    try {
        const { email, code } = req.body;

        // Validate input
        if (!email || !code) {
            return res.status(400).json({ message: "Email and code are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User with this email does not exist" });
        }

        const resetToken = await PasswordResetToken.findOne({
            userId: user._id,
            token: code,
            expiresAt: { $gt: new Date() }
        });

        if (!resetToken) {
            return res.status(400).json({ message: "Invalid or expired reset code" });
        }

        res.status(200).json({ message: "Code verified successfully" });
    } catch (error) {
        console.error("Verify reset code error:", error);
        res.status(500).json({ message: "Error verifying reset code", error: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;

        // Validate input
        if (!email || !code || !newPassword) {
            return res.status(400).json({ message: "Email, code, and new password are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password must be at least 6 characters" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User with this email does not exist" });
        }

        const resetToken = await PasswordResetToken.findOne({
            userId: user._id,
            token: code,
            expiresAt: { $gt: new Date() }
        });

        if (!resetToken) {
            return res.status(400).json({ message: "Invalid or expired reset code" });
        }

        // Update the user's password
        user.password = newPassword;
        await user.save();

        // Delete the reset token
        await PasswordResetToken.deleteMany({ userId: user._id });

        res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ message: "Error resetting password", error: error.message });
    }
};

exports.createNotice = async (req, res) => {
    try {
        const { title, description, date, classId } = req.body;
        const teacherId = req.user.id;

        // Validate input
        if (!title || !description || !date || !classId) {
            return res.status(400).json({ message: "Title, description, date, and class are required" });
        }

        // Validate class ownership
        const classData = await Class.findOne({ _id: classId, teacherId });
        if (!classData) {
            return res.status(403).json({ message: "Class not found or you are not the teacher of this class" });
        }

        // Create the notice
        const notice = new Notice({
            title,
            description,
            date,
            classId,
            teacherId,
            readBy: [] // Initialize as empty
        });
        await notice.save();

        res.status(201).json({ message: "Notice created successfully", notice });
    } catch (error) {
        console.error("Create notice error:", error);
        res.status(500).json({ message: "Error creating notice", error: error.message });
    }
};

exports.getTeacherNotices = async (req, res) => {
    try {
        const teacherId = req.user.id;

        const notices = await Notice.find({ teacherId })
            .populate("classId", "subject")
            .sort({ createdAt: -1 });

        res.status(200).json(notices);
    } catch (error) {
        console.error("Get teacher notices error:", error);
        res.status(500).json({ message: "Error retrieving notices", error: error.message });
    }
};

exports.updateNotice = async (req, res) => {
    try {
        const { noticeId, title, description, date, classId } = req.body;
        const teacherId = req.user.id;

        // Validate input
        if (!noticeId || !title || !description || !date || !classId) {
            return res.status(400).json({ message: "Notice ID, title, description, date, and class are required" });
        }

        // Validate class ownership
        const classData = await Class.findOne({ _id: classId, teacherId });
        if (!classData) {
            return res.status(403).json({ message: "Class not found or you are not the teacher of this class" });
        }

        // Find the notice and ensure it belongs to the teacher
        const notice = await Notice.findOne({ _id: noticeId, teacherId });
        if (!notice) {
            return res.status(403).json({ message: "Notice not found or you are not the creator of this notice" });
        }

        // Update the notice
        notice.title = title;
        notice.description = description;
        notice.date = date;
        notice.classId = classId;
        await notice.save();

        res.status(200).json({ message: "Notice updated successfully", notice });
    } catch (error) {
        console.error("Update notice error:", error);
        res.status(500).json({ message: "Error updating notice", error: error.message });
    }
};

exports.deleteNotice = async (req, res) => {
    try {
        const { noticeId } = req.params;
        const teacherId = req.user.id;

        // Find the notice and ensure it belongs to the teacher
        const notice = await Notice.findOne({ _id: noticeId, teacherId });
        if (!notice) {
            return res.status(403).json({ message: "Notice not found or you are not the creator of this notice" });
        }

        // Delete the notice
        await Notice.deleteOne({ _id: noticeId });

        res.status(200).json({ message: "Notice deleted successfully" });
    } catch (error) {
        console.error("Delete notice error:", error);
        res.status(500).json({ message: "Error deleting notice", error: error.message });
    }
};

exports.getStudentNotices = async (req, res) => {
    try {
        const studentId = req.user.id;

        // Find active subscriptions for the student
        const subscriptions = await StudentSubscription.find({
            userId: studentId,
            status: "Active"
        });
        const classIds = subscriptions.map(sub => sub.classId);

        // Find notices for those classes
        const notices = await Notice.find({ classId: { $in: classIds } })
            .populate("classId", "subject")
            .populate("teacherId", "name")
            .sort({ createdAt: -1 });

        // Add unread flag for each notice
        const noticesWithUnread = notices.map(notice => ({
            ...notice.toObject(),
            unread: !notice.readBy.includes(studentId)
        }));

        res.status(200).json(noticesWithUnread);
    } catch (error) {
        console.error("Get student notices error:", error);
        res.status(500).json({ message: "Error retrieving notices", error: error.message });
    }
};

exports.markNoticeAsRead = async (req, res) => {
    try {
        const { noticeId } = req.params;
        const studentId = req.user.id;

        // Find the notice
        const notice = await Notice.findById(noticeId);
        if (!notice) {
            return res.status(404).json({ message: "Notice not found" });
        }

        // Check if the student has access to the notice
        const subscriptions = await StudentSubscription.find({
            userId: studentId,
            status: "Active"
        });
        const classIds = subscriptions.map(sub => sub.classId.toString());
        if (!classIds.includes(notice.classId.toString())) {
            return res.status(403).json({ message: "You do not have access to this notice" });
        }

        // Mark the notice as read by adding the student to readBy
        if (!notice.readBy.includes(studentId)) {
            notice.readBy.push(studentId);
            await notice.save();
        }

        res.status(200).json({ message: "Notice marked as read" });
    } catch (error) {
        console.error("Mark notice as read error:", error);
        res.status(500).json({ message: "Error marking notice as read", error: error.message });
    }
};

exports.getNoticeById = async (req, res) => {
    try {
        const { noticeId } = req.params;
        const studentId = req.user.id;

        // Find active subscriptions for the student
        const subscriptions = await StudentSubscription.find({
            userId: studentId,
            status: "Active"
        });
        const classIds = subscriptions.map(sub => sub.classId);

        // Find the notice and ensure it's for a class the student is subscribed to
        const notice = await Notice.findOne({ 
            _id: noticeId,
            classId: { $in: classIds }
        })
            .populate("classId", "subject")
            .populate("teacherId", "name");

        if (!notice) {
            return res.status(404).json({ message: "Notice not found or you do not have access to this notice" });
        }

        res.status(200).json(notice);
    } catch (error) {
        console.error("Get notice by ID error:", error);
        res.status(500).json({ message: "Error retrieving notice", error: error.message });
    }
};

// Admin Notice Management (using TeacherInstituteNotice model)
exports.createAdminNotice = async (req, res) => {
    try {
        const { title, description, date, recipients } = req.body;
        const adminId = req.user.id;

        // Validate input
        if (!title || !description || !date || !recipients) {
            return res.status(400).json({ message: "Title, description, date, and recipients are required" });
        }

        // Validate admin role
        const user = await User.findById(adminId);
        if (user.role !== "admin") {
            return res.status(403).json({ message: "Only admins can create notices for teachers and institutes" });
        }

        // Validate recipients
        if (!["teachers", "institutes", "teachers_and_institutes"].includes(recipients)) {
            return res.status(400).json({ message: "Invalid recipients value" });
        }

        // Create the notice
        const notice = new TeacherInstituteNotice({
            title,
            description,
            date,
            adminId,
            recipients,
            readBy: []
        });
        await notice.save();

        res.status(201).json({ message: "Notice created successfully", notice });
    } catch (error) {
        console.error("Create admin notice error:", error);
        res.status(500).json({ message: "Error creating notice", error: error.message });
    }
};

exports.getAdminNotices = async (req, res) => {
    try {
        const adminId = req.user.id;

        // Validate admin role
        const user = await User.findById(adminId);
        if (user.role !== "admin") {
            return res.status(403).json({ message: "Only admins can view admin notices" });
        }

        const notices = await TeacherInstituteNotice.find({ adminId })
            .sort({ createdAt: -1 });

        res.status(200).json(notices);
    } catch (error) {
        console.error("Get admin notices error:", error);
        res.status(500).json({ message: "Error retrieving notices", error: error.message });
    }
};

exports.updateAdminNotice = async (req, res) => {
    try {
        const { noticeId, title, description, date, recipients } = req.body;
        const adminId = req.user.id;

        // Validate input
        if (!noticeId || !title || !description || !date || !recipients) {
            return res.status(400).json({ message: "Notice ID, title, description, date, and recipients are required" });
        }

        // Validate admin role
        const user = await User.findById(adminId);
        if (user.role !== "admin") {
            return res.status(403).json({ message: "Only admins can update admin notices" });
        }

        // Validate recipients
        if (!["teachers", "institutes", "teachers_and_institutes"].includes(recipients)) {
            return res.status(400).json({ message: "Invalid recipients value" });
        }

        // Find the notice and ensure it belongs to the admin
        const notice = await TeacherInstituteNotice.findOne({ _id: noticeId, adminId });
        if (!notice) {
            return res.status(403).json({ message: "Notice not found or you are not the creator of this notice" });
        }

        // Update the notice
        notice.title = title;
        notice.description = description;
        notice.date = date;
        notice.recipients = recipients;
        await notice.save();

        res.status(200).json({ message: "Notice updated successfully", notice });
    } catch (error) {
        console.error("Update admin notice error:", error);
        res.status(500).json({ message: "Error updating notice", error: error.message });
    }
};

exports.deleteAdminNotice = async (req, res) => {
    try {
        const { noticeId } = req.params;
        const adminId = req.user.id;

        // Validate admin role
        const user = await User.findById(adminId);
        if (user.role !== "admin") {
            return res.status(403).json({ message: "Only admins can delete admin notices" });
        }

        // Find the notice and ensure it belongs to the admin
        const notice = await TeacherInstituteNotice.findOne({ _id: noticeId, adminId });
        if (!notice) {
            return res.status(403).json({ message: "Notice not found or you are not the creator of this notice" });
        }

        // Delete the notice
        await TeacherInstituteNotice.deleteOne({ _id: noticeId });

        res.status(200).json({ message: "Notice deleted successfully" });
    } catch (error) {
        console.error("Delete admin notice error:", error);
        res.status(500).json({ message: "Error deleting notice", error: error.message });
    }
};

// Teacher/Institute Notice Viewing (using TeacherInstituteNotice model)
exports.getAdminNoticesForUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!["teacher", "institute"].includes(user.role)) {
            return res.status(403).json({ message: "Only teachers and institutes can view admin notices" });
        }

        // Find notices based on user role
        const query = {
            $or: [
                { recipients: user.role === "teacher" ? "teachers" : "institutes" },
                { recipients: "teachers_and_institutes" }
            ]
        };

        const notices = await TeacherInstituteNotice.find(query)
            .populate("adminId", "name")
            .sort({ createdAt: -1 });

        // Add unread flag for each notice
        const noticesWithUnread = notices.map(notice => ({
            ...notice.toObject(),
            unread: !notice.readBy.includes(userId)
        }));

        res.status(200).json(noticesWithUnread);
    } catch (error) {
        console.error("Get admin notices for user error:", error);
        res.status(500).json({ message: "Error retrieving notices", error: error.message });
    }
};

exports.markAdminNoticeAsRead = async (req, res) => {
    try {
        const { noticeId } = req.params;
        const userId = req.user.id;

        // Find the notice
        const notice = await TeacherInstituteNotice.findById(noticeId);
        if (!notice) {
            return res.status(404).json({ message: "Notice not found" });
        }

        // Validate user role and access
        const user = await User.findById(userId);
        if (!["teacher", "institute"].includes(user.role) || 
            (notice.recipients === "teachers" && user.role !== "teacher") ||
            (notice.recipients === "institutes" && user.role !== "institute")) {
            return res.status(403).json({ message: "You do not have access to this notice" });
        }

        // Mark the notice as read by adding the user to readBy
        if (!notice.readBy.includes(userId)) {
            notice.readBy.push(userId);
            await notice.save();
        }

        res.status(200).json({ message: "Notice marked as read" });
    } catch (error) {
        console.error("Mark admin notice as read error:", error);
        res.status(500).json({ message: "Error marking notice as read", error: error.message });
    }
};

exports.TeacherInstitutegetNoticeById = async (req, res) => {
    try {
        const { noticeId } = req.params;
        const userId = req.user.id;

        // Find the notice
        const notice = await TeacherInstituteNotice.findById(noticeId)
            .populate("adminId", "name");

        if (!notice) {
            return res.status(404).json({ message: "Notice not found" });
        }

        // Get the user's role
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Ensure the user is a teacher or institute
        if (!["teacher", "institute"].includes(user.role)) {
            return res.status(403).json({ message: "Only teachers and institutes can access admin notices" });
        }

        // Check access based on recipients
        if ((notice.recipients === "teachers" && user.role !== "teacher") ||
            (notice.recipients === "institutes" && user.role !== "institute")) {
            return res.status(403).json({ message: "You do not have access to this notice" });
        }

        res.status(200).json(notice);
    } catch (error) {
        console.error("Teacher/Institute get notice by ID error:", error);
        res.status(500).json({ message: "Error retrieving notice", error: error.message });
    }
};

// New endpoint: Institute adds a teacher with a default password
exports.addTeacher = async (req, res) => {
    try {
        const instituteId = req.user.id;
        const { name, email, age } = req.body;

        // Validate institute role
        const institute = await User.findById(instituteId);
        if (!institute || institute.role !== "institute") {
            return res.status(403).json({ message: "Only institutes can add teachers" });
        }

        // Check if email already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "Email already in use" });
        }

        // Get the institute's subscription
        const subscription = await Subscription.findById(institute.subscriptionId);
        if (!subscription) {
            return res.status(400).json({ message: "Institute subscription not found" });
        }

        // Check teacher account limit
        const teacherCount = await User.countDocuments({
            role: "teacher",
            addedByInstitute: instituteId
        });

        if (teacherCount >= subscription.teacherAccounts) {
            return res.status(403).json({ message: "Teacher account limit reached for your subscription plan" });
        }

        // Generate a default password
        const defaultPassword = "teacher123"; // You can make this more dynamic or configurable

        // Create the teacher
        const teacher = await User.create({
            name,
            email,
            password: defaultPassword,
            role: "teacher",
            age,
            subscriptionId: institute.subscriptionId,
            subscriptionStatus: "active", // Inherit institute's subscription status
            addedByInstitute: instituteId
        });

        res.status(201).json({
            message: "Teacher added successfully",
            teacher: {
                _id: teacher._id,
                name: teacher.name,
                email: teacher.email,
                role: teacher.role,
                defaultPassword: defaultPassword // Send default password to institute
            }
        });
    } catch (error) {
        console.error("Add teacher error:", error);
        res.status(500).json({ message: "Error adding teacher", error: error.message });
    }
};

// New endpoint: Get teachers added by the institute
exports.getTeachersByInstitute = async (req, res) => {
    try {
        const instituteId = req.user.id;

        // Validate institute role
        const institute = await User.findById(instituteId);
        if (!institute || institute.role !== "institute") {
            return res.status(403).json({ message: "Only institutes can view their added teachers" });
        }

        // Get teachers added by this institute
        const teachers = await User.find({
            role: "teacher",
            addedByInstitute: instituteId
        }).select('-password');

        res.status(200).json(teachers);
    } catch (error) {
        console.error("Get teachers by institute error:", error);
        res.status(500).json({ message: "Error retrieving teachers", error: error.message });
    }
};

// Get the 5 most recent users (teachers or institutes)
exports.getRecentUsers = async (req, res) => {
    try {
        // Validate admin role
        const adminId = req.user.id;
        const user = await User.findById(adminId);
        if (user.role !== "admin") {
            return res.status(403).json({ message: "Only admins can view recent users" });
        }

        // Fetch the 5 most recent users who are teachers or institutes
        const recentUsers = await User.find({
            role: { $in: ["teacher", "institute"] }
        })
            .sort({ createdAt: -1 }) // Sort by creation date, newest first
            .limit(5) // Limit to 5 users
            .select("name role createdAt"); // Select only needed fields

        // Format the response to match the frontend requirements
        const formattedActivities = recentUsers.map((user, index) => {
            const timeAgo = getTimeAgo(user.createdAt); // Helper function to calculate time ago
            return {
                id: index + 1,
                user: user.name,
                action: "joined as",
                target: user.role === "teacher" ? "New Teacher" : "New Institute",
                time: timeAgo,
                avatar: user.name.charAt(0).toUpperCase() + (user.name.split(" ")[1]?.charAt(0).toUpperCase() || ""), // Generate avatar initials
                targetType: "user"
            };
        });

        res.status(200).json(formattedActivities);
    } catch (error) {
        console.error("Get recent users error:", error);
        res.status(500).json({ message: "Error retrieving recent users", error: error.message });
    }
};

// Helper function to calculate "time ago" (e.g., "2 hours ago")
const getTimeAgo = (date) => {
    const now = new Date();
    const createdAt = new Date(date);
    const diffInMs = now - createdAt;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) {
        return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
        return `${diffInHours} hours ago`;
    } else if (diffInDays === 1) {
        return "Yesterday";
    } else {
        return `${diffInDays} days ago`;
    }
};



module.exports = exports;
