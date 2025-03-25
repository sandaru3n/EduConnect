//backend/models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

messageSchema.index({ sender: 1, timestamp: 1 });
messageSchema.index({ recipient: 1, timestamp: 1 });

module.exports = mongoose.model('Message', messageSchema);