//backend/controllers/authController.js
const User = require("../models/User");
const generateToken = require("../config/jwt");

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
            name, email, password, passwordConfirm, 
            firstName, lastName, contactNumber, dateOfBirth, 
            guardianName, guardianContactNumber, addressLine1, addressLine2, district, zipCode, address, username, age 
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

        // Update password if provided and confirmed
        if (password && passwordConfirm) {
            if (password !== passwordConfirm) {
                return res.status(400).json({ message: "Passwords do not match" });
            }
            user.password = password;
        }

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
            user.address = address || user.address;
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
                address: user.address,
                username: user.username,
                age: user.age
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
};

module.exports = exports;
