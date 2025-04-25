const mongoose = require("mongoose");

const noticeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Added to track users who have read the notice
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Notice", noticeSchema);