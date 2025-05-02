const mongoose = require("mongoose");

const feeWaiverSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true }, // Add classId field
    reason: { type: String, required: true },
    documentPath: { type: String },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    teacherComments: { type: String },
    discountPercentage: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("FeeWaiver", feeWaiverSchema);