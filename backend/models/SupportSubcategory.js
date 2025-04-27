const mongoose = require("mongoose");

const supportSubcategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "SupportCategory", required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("SupportSubcategory", supportSubcategorySchema);