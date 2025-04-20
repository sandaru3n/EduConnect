// backend/models/ClassMaterial.js
const mongoose = require("mongoose");

const ClassMaterialSchema = new mongoose.Schema({
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    title: { type: String, required: true },
    lessonName: { type: String, required: true },
    type: { type: String, enum: ["video", "link", "pdf"], required: true },
    content: { type: String, required: true },
    uploadDate: { type: Date, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    accessStartTime: { type: Date },
    extensionApproved: { type: Boolean, default: false }, // New field to track approved extension
    extendRequests: [{
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        reason: { type: String, required: true },
        status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
        requestedAt: { type: Date, default: Date.now }
    }]
});

module.exports = mongoose.model("ClassMaterial", ClassMaterialSchema);




    
    
    
    
    
    
