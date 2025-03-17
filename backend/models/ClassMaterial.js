// backend/models/ClassMaterial.js
const mongoose = require("mongoose");

const ClassMaterialSchema = new mongoose.Schema({
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    title: { type: String, required: true },
    type: { type: String, enum: ["video", "link", "document"], required: true },
    content: { type: String, required: true }, // URL or file path
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ClassMaterial", ClassMaterialSchema);




    
    
    
    
    
    
