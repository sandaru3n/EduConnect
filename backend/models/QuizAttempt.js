const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    selectedAnswer: { type: String, required: true },
    isCorrect: { type: Boolean, required: true }
});

const quizAttemptSchema = new mongoose.Schema({
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    answers: [answerSchema],
    marks: { type: Number, required: true },
    startTime: { type: Date }, // New field to store when the quiz attempt started
    attemptedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);