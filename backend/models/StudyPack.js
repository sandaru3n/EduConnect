// StudyPack.js (Model)
const mongoose = require('mongoose');

const StudyPackSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  file: { type: String, required: true },  // File URL or path (e.g., PDF, Word, Video)
  subject: { type: String, required: true },
  course: { type: String, required: true },
  topic: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // Reference to the user who uploaded the pack
  uploadDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StudyPack', StudyPackSchema);
