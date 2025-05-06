//backend/model/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Define the schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true }, // Added for compatibility with authController
    firstName: { type: String }, // Required for students, optional for others
    lastName: { type: String }, // Required for students, optional for others
    contactNumber: { type: String }, // Required for students
    dateOfBirth: { type: String }, // Required for students
    guardianName: { type: String }, // Required for students
    guardianContactNumber: { type: String }, // Required for students
    addressLine1: { type: String }, // Required for students
    addressLine2: { type: String }, // Optional for students
    district: { type: String }, // Required for students
    zipCode: { type: String }, // Required for students
    age:{ type: String }, // Required for teacher
    email: { type: String, required: true, unique: true },
    username: { type: String, unique: true }, // Required for students
    password: { type: String, required: true },
    role: { 
        type: String, 
        required: true, 
        enum: ["student", "teacher", "institute", "admin"] 
    },
    profilePicture: { type: String }, // New field for profile picture path
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription" }, // For teacher/institute
    subscriptionStatus: { 
        type: String, 
        enum: ["active", "inactive"], 
        default: "inactive" 
    }, // For teacher/institute
     // For teacher/institute
     addedByInstitute: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // Tracks which institute added this teacher
    createdAt: { type: Date, default: Date.now },
});

// Password hashing before saving user
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare user-entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Export the model
module.exports = mongoose.model("User", userSchema);