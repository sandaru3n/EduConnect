// backend/models/Subscription.js
const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  plan: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  studentLimit: {
    type: Number,
    required: true
  },
  teacherAccounts: {
    type: Number,
    required: true
  },
  storage: {
    type: String,
    required: true,
    trim: true
  },
  support: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);