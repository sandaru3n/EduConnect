// backend/models/StudyPackSubscription.js
const mongoose = require('mongoose');

const StudyPackSubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studyPackId: { type: mongoose.Schema.Types.ObjectId, ref: 'StudyPack', required: true },
  feePaid: { type: Number, required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('StudyPackSubscription', StudyPackSubscriptionSchema);