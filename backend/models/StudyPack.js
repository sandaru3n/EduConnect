// backend/models/StudyPack.js
const mongoose = require('mongoose');

const StudyPackSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  price: { type: Number, required: true },
  coverPhotoPath: { type: String, required: true },
  files: [{
    lessonName: { type: String, required: true }, // Added lesson name
    type: { type: String, enum: ['pdf', 'video', 'url'], required: true },
    content: { type: String, required: true }, // Path for pdf/video, URL for links
  }],
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('StudyPack', StudyPackSchema);