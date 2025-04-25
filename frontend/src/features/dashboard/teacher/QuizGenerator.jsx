import { useState, useEffect } from "react";
import axios from "axios";
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from "@mui/material";
import useAuth from "../../../hooks/useAuth";

const QuizGenerator = () => {
    const { user } = useAuth();
    const [lessonName, setLessonName] = useState("");
    const [classId, setClassId] = useState("");
    const [classes, setClasses] = useState([]);
    const [numberOfQuestions, setNumberOfQuestions] = useState(10);
    const [timer, setTimer] = useState(30); // Default to 30 minutes
    const [quiz, setQuiz] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` }
                };
                const { data } = await axios.get("http://localhost:5000/api/quiz/teacher/classes", config);
                setClasses(data);
            } catch (err) {
                setError(err.response?.data?.message || "Error loading classes");
            }
        };
        fetchClasses();
    }, [user.token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setQuiz(null);
        setLoading(true);

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    "Content-Type": "application/json"
                }
            };
            const { data } = await axios.post(
                "http://localhost:5000/api/quiz/generate",
                { lessonName, classId, numberOfQuestions, timer },
                config
            );

            setQuiz(data.quiz);
        } catch (err) {
            setError(err.response?.data?.message || "Error generating quiz");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 800, mx: "auto", p: 3, mt: "50px" }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h4" gutterBottom>Generate Quiz</Typography>
                <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
                    Enter the lesson details to generate multiple-choice questions (MCQs) using AI.
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Lesson Name"
                        value={lessonName}
                        onChange={(e) => setLessonName(e.target.value)}
                        margin="normal"
                        placeholder="E.g., Introduction to Algebra"
                        variant="outlined"
                        required
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Select Class</InputLabel>
                        <Select
                            value={classId}
                            onChange={(e) => setClassId(e.target.value)}
                            label="Select Class"
                            required
                        >
                            {classes.map((cls) => (
                                <MenuItem key={cls._id} value={cls._id}>{cls.subject}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        label="Number of Questions"
                        type="number"
                        value={numberOfQuestions}
                        onChange={(e) => setNumberOfQuestions(Number(e.target.value))}
                        margin="normal"
                        variant="outlined"
                        inputProps={{ min: 1 }}
                        required
                    />
                    <TextField
                        fullWidth
                        label="Timer (minutes)"
                        type="number"
                        value={timer}
                        onChange={(e) => setTimer(Number(e.target.value))}
                        margin="normal"
                        variant="outlined"
                        inputProps={{ min: 1 }}
                        required
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={loading}
                        sx={{ py: 1.5, textTransform: 'none', mt: 2 }}
                    >
                        {loading ? <CircularProgress size={24} /> : "Generate Quiz"}
                    </Button>
                </form>
                {quiz && (
                    <Card sx={{ mt: 4, borderRadius: 2, boxShadow: 3 }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ mb: 2 }}>
                                Generated Quiz: {quiz.lessonName} (Timer: {quiz.timer} minutes)
                            </Typography>
                            {quiz.questions.map((q, index) => (
                                <Box key={index} sx={{ mb: 3 }}>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                        {index + 1}. {q.question}
                                    </Typography>
                                    <Typography variant="body2" sx={{ ml: 2, mt: 1 }}>
                                        A) {q.options.correct} (Correct)
                                    </Typography>
                                    {q.options.incorrect.map((opt, idx) => (
                                        <Typography key={idx} variant="body2" sx={{ ml: 2 }}>
                                            {String.fromCharCode(66 + idx)}) {opt}
                                        </Typography>
                                    ))}
                                </Box>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </Paper>
        </Box>
    );
};

export default QuizGenerator;