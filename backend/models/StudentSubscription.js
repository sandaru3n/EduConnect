// backend/models/StudentSubscription.js
const mongoose = require('mongoose');

const studentsubscriptionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
    feePaid: { type: Number, required: true }, // New field for payment amount
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    createdAt: { type: Date, default: Date.now } // Used as payment date
});

module.exports = mongoose.model('StudentSubscription', studentsubscriptionSchema);