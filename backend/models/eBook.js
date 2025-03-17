// backend/models/eBook.js
const mongoose = require('mongoose');

const eBookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true },
  author: { type: String, required: true },
  filePath: { type: String, required: true },
  coverPhotoPath: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  uploadDate: { type: Date, default: Date.now },
  downloadCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('EBook', eBookSchema);