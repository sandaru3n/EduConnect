const mongoose = require("mongoose");

const teacherInstituteNoticeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    recipients: { 
        type: String, 
        enum: ["teachers", "institutes", "teachers_and_institutes"], 
        required: true
    },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("TeacherInstituteNotice", teacherInstituteNoticeSchema);