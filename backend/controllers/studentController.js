// backend/controllers/studentController.js
const User = require("../models/User");

exports.getActiveTeachers = async (req, res) => {
    try {
        // Fetch users where role is "teacher" and subscriptionStatus is "active"
        const teachers = await User.find({ 
            role: "teacher", 
            subscriptionStatus: "active" 
        })
        .select("name email") // Select only name and email fields
        .sort("name"); // Sort alphabetically by name

        res.status(200).json(teachers);
    } catch (error) {
        console.error("Error fetching active teachers:", error);
        res.status(500).json({ message: "Server error while fetching teachers" });
    }
};

module.exports = exports;