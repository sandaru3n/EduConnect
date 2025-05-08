// backend/models/RefundRequest.js
const mongoose = require('mongoose');

const refundRequestSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentSubscription', required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    classFee: { type: Number, required: true },
    requestDate: { type: Date, default: Date.now },
    proof: { type: String } // New field for storing the proof file path
});

module.exports = mongoose.model('RefundRequest', refundRequestSchema);