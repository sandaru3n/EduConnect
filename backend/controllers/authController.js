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
