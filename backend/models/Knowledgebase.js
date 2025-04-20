// backend/models/Knowledgebase.js
const mongoose = require('mongoose');

const knowledgebaseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, required: true }, // e.g., "Set Up Your Account", "Work With Your Team"
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Knowledgebase', knowledgebaseSchema);