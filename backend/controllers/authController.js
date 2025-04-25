//backend/controllers/authController.js
const User = require("../models/User");
const generateToken = require("../config/jwt");


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
    if (!subscriptionId) return res.status(400).json({ message: "Subscription plan is required for teachers" });
    userData.subscriptionId = subscriptionId;
    } else if (role === "institute") {
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

module.exports = exports;
