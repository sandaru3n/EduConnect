// backend/models/Class.js
const mongoose = require("mongoose");

const ClassSchema = new mongoose.Schema({
    subject: { type: String, required: true },
    monthlyFee: { type: Number, required: true },
    description: { type: String },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    coverPhoto: { type: String }, // New field for cover photo path
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Class", ClassSchema);
