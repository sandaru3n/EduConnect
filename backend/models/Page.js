// backend/models/Page.js
const mongoose = require("mongoose");

const PageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true, required: true },
  content: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Page", PageSchema);
