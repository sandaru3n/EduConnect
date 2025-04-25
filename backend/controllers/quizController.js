const { GoogleGenerativeAI } = require("@google/generative-ai");
const mongoose = require("mongoose");
const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");
const Class = require("../models/Class");
const StudentSubscription = require("../models/StudentSubscription");

exports.generateMCQs = async (req, res) => {
    try {
        const { lessonName, classId, numberOfQuestions = 10, timer } = req.body;
        const teacherId = req.user.id;

        // Validate input
        if (!lessonName || !classId || !numberOfQuestions || !timer) {
            return res.status(400).json({ message: "Lesson name, class ID, number of questions, and timer are required" });
        }

        // Validate class ownership
        const classData = await Class.findOne({ _id: classId, teacherId });
        if (!classData) {
            return res.status(403).json({ message: "Class not found or you are not the teacher of this class" });
        }

        // Validate API key
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ message: "Google Gemini API key is not configured" });
        }

        // Initialize Gemini API
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Prepare prompt
        const prompt = `
You are an expert academic tutor. Generate ${numberOfQuestions} multiple-choice questions (MCQs) for a lesson titled "${lessonName}". Each MCQ should have:
- One correct answer.
- Three incorrect but plausible answers.
- Format each question as plain text in the following structure:
  Question X: [Question text]
  A) [Correct answer]
  B) [Incorrect answer 1]
  C) [Incorrect answer 2]
  D) [Incorrect answer 3]

Ensure the questions are appropriate for high school students, stimulate critical thinking, and align with the lesson topic. Return the response as plain text, with each question separated by a newline.
        `;

        // Call Gemini API
        const result = await model.generateContent(prompt);
        const responseText = await result.response.text();
        console.log("Raw Gemini Response:", responseText);

        // Parse the response into questions
        const questionLines = responseText.split("\n").filter(line => line.trim());
        const questions = [];
        let currentQuestion = null;

        for (let i = 0; i < questionLines.length; i++) {
            const line = questionLines[i].trim();
            if (line.startsWith("Question")) {
                if (currentQuestion) {
                    if (currentQuestion.options.incorrect.length === 3) {
                        questions.push(currentQuestion);
                    }
                }
                currentQuestion = {
                    question: line.replace(/^Question \d+:\s*/, ""),
                    options: { correct: "", incorrect: [] }
                };
            } else if (line.startsWith("A)")) {
                currentQuestion.options.correct = line.replace(/^A\)\s*/, "");
            } else if (line.startsWith("B)") || line.startsWith("C)") || line.startsWith("D)")) {
                currentQuestion.options.incorrect.push(line.replace(/^[B-D]\)\s*/, ""));
            }
        }

        // Add the last question
        if (currentQuestion && currentQuestion.options.incorrect.length === 3) {
            questions.push(currentQuestion);
        }

        // Validate the number of questions
        if (questions.length !== numberOfQuestions) {
            return res.status(500).json({ message: `Expected ${numberOfQuestions} questions, but generated ${questions.length}` });
        }

        // Save the quiz to MongoDB
        const quiz = new Quiz({
            lessonName,
            classId,
            teacherId,
            timer,
            questions
        });
        await quiz.save();

        res.status(200).json({
            message: "MCQs generated and saved successfully",
            quiz
        });
    } catch (error) {
        console.error("MCQ generation error:", error);
        res.status(500).json({ message: "Error generating MCQs", error: error.message });
    }
};

exports.attemptQuiz = async (req, res) => {
    try {
        const { quizId, answers } = req.body;
        const studentId = req.user.id;

        // Validate input
        if (!quizId || !answers || !Array.isArray(answers)) {
            return res.status(400).json({ message: "Quiz ID and answers are required" });
        }

        // Log the incoming request body for debugging
        console.log("Attempt Quiz Request:", { quizId, studentId, answers });

        // Validate quizId
        if (!mongoose.Types.ObjectId.isValid(quizId)) {
            return res.status(400).json({ message: "Invalid quiz ID" });
        }

        // Check if student has already attempted the quiz
        const existingAttempt = await QuizAttempt.findOne({ quizId, studentId });
        if (existingAttempt) {
            return res.status(400).json({ message: "You have already attempted this quiz" });
        }

        // Fetch the quiz
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        // Check if student is subscribed to the class with Active status
        const subscription = await StudentSubscription.findOne({
            userId: studentId,
            classId: quiz.classId,
            status: "Active"
        });
        if (!subscription) {
            return res.status(403).json({ message: "You are not subscribed to the class for this quiz or your subscription is inactive" });
        }

        // Validate and grade answers
        const gradedAnswers = [];
        let marks = 0;
        for (const answer of answers) {
            const { questionId, selectedAnswer } = answer;

            // Validate questionId
            if (!mongoose.Types.ObjectId.isValid(questionId)) {
                return res.status(400).json({ message: `Invalid question ID: ${questionId}` });
            }

            const question = quiz.questions.id(questionId);
            if (!question) {
                return res.status(400).json({ message: `Question ${questionId} not found in quiz` });
            }

            const isCorrect = selectedAnswer === question.options.correct;
            if (isCorrect) {
                marks += 1;
            }
            gradedAnswers.push({
                questionId: questionId, // Ensure questionId is set
                question: question.question,
                selectedAnswer: selectedAnswer || "Not Answered",
                correctAnswer: question.options.correct,
                isCorrect
            });
        }

        // Log the graded answers for debugging
        console.log("Graded Answers:", gradedAnswers);

        // Save the quiz attempt
        const quizAttempt = new QuizAttempt({
            quizId,
            studentId,
            answers: gradedAnswers.map(answer => ({
                questionId: answer.questionId, // Use questionId from gradedAnswers
                selectedAnswer: answer.selectedAnswer,
                isCorrect: answer.isCorrect
            })),
            marks
        });

        // Log the quiz attempt document before saving
        console.log("Quiz Attempt Document:", quizAttempt.toObject());

        await quizAttempt.save();

        res.status(200).json({
            message: "Quiz submitted successfully",
            marks,
            totalMarks: quiz.questions.length,
            answers: gradedAnswers
        });
    } catch (error) {
        console.error("Quiz attempt error:", error);
        res.status(500).json({ message: "Error submitting quiz", error: error.message });
    }
};

exports.getQuizResults = async (req, res) => {
    try {
        const { quizId } = req.params;
        const studentId = req.user.id;

        const attempt = await QuizAttempt.findOne({ quizId, studentId });
        if (!attempt) {
            return res.status(404).json({ message: "Quiz attempt not found" });
        }

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        res.status(200).json({
            marks: attempt.marks,
            totalMarks: quiz.questions.length,
            answers: attempt.answers.map(answer => {
                const question = quiz.questions.id(answer.questionId);
                return {
                    question: question.question,
                    selectedAnswer: answer.selectedAnswer,
                    correctAnswer: question.options.correct,
                    isCorrect: answer.isCorrect
                };
            })
        });
    } catch (error) {
        console.error("Get quiz results error:", error);
        res.status(500).json({ message: "Error retrieving quiz results", error: error.message });
    }
};

exports.getQuizById = async (req, res) => {
    try {
        const { quizId } = req.params;
        const studentId = req.user.id;

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        // Check if student is subscribed to the class with Active status
        const subscription = await StudentSubscription.findOne({
            userId: studentId,
            classId: quiz.classId,
            status: "Active"
        });
        if (!subscription) {
            return res.status(403).json({ message: "You are not subscribed to the class for this quiz or your subscription is inactive" });
        }

        res.status(200).json(quiz);
    } catch (error) {
        console.error("Get quiz by ID error:", error);
        res.status(500).json({ message: "Error retrieving quiz", error: error.message });
    }
};

exports.getAvailableQuizzes = async (req, res) => {
    try {
        const studentId = req.user.id;

        // Find active subscriptions for the student
        const subscriptions = await StudentSubscription.find({
            userId: studentId,
            status: "Active"
        });
        const classIds = subscriptions.map(sub => sub.classId);

        // Find quizzes for those classes
        const quizzes = await Quiz.find({ classId: { $in: classIds } });

        // Filter out quizzes the student has already attempted
        const attempts = await QuizAttempt.find({ studentId });
        const attemptedQuizIds = attempts.map(attempt => attempt.quizId.toString());
        const availableQuizzes = quizzes.filter(quiz => !attemptedQuizIds.includes(quiz._id.toString()));

        res.status(200).json(availableQuizzes);
    } catch (error) {
        console.error("Get available quizzes error:", error);
        res.status(500).json({ message: "Error retrieving available quizzes", error: error.message });
    }
};

exports.getTeacherClasses = async (req, res) => {
    try {
        const teacherId = req.user.id;

        const classes = await Class.find({ teacherId });
        res.status(200).json(classes);
    } catch (error) {
        console.error("Get teacher classes error:", error);
        res.status(500).json({ message: "Error retrieving teacher classes", error: error.message });
    }
};

module.exports = exports;