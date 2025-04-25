const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: {
        correct: { type: String, required: true },
        incorrect: [{ type: String, required: true, length: 3 }]
    }
});

const quizSchema = new mongoose.Schema({
    lessonName: { type: String, required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true }, // New field for class
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    timer: { type: Number, required: true, min: 1 }, // Timer in minutes
    questions: [questionSchema],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Quiz", quizSchema);