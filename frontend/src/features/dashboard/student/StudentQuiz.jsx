import { useState, useEffect } from "react";
import axios from "axios";
import {
    Box,
    Typography,
    Button,
    Paper,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Radio,
    RadioGroup,
    FormControlLabel,
    FormControl
} from "@mui/material";
import { CheckCircleOutline } from "@mui/icons-material";
import useAuth from "../../../hooks/useAuth";
import StudentSidebar from "../../../components/StudentSidebar/index";
import StudentHeader from "../../../components/StudentHeader/index";
import { Breadcrumbs, Link as MuiLink } from "@mui/material";
import { Link, useLocation, useParams } from "react-router-dom";

const StudentQuiz = () => {
    const { user } = useAuth();
    const { quizId } = useParams();
    const location = useLocation();
    const [quiz, setQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null); // Time left in seconds

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    useEffect(() => {
        const handleResize = () => {
            const mobileView = window.innerWidth <= 768;
            setIsMobile(mobileView);
            setIsSidebarCollapsed(mobileView);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const fetchQuiz = async () => {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };

            try {
                const { data } = await axios.get(`http://localhost:5000/api/quiz/results/${quizId}`, config);
                setResults(data);
            } catch (err) {
                if (err.response?.status === 404) {
                    try {
                        const { data } = await axios.get(`http://localhost:5000/api/quiz/${quizId}`, config);
                        setQuiz(data);
                        // Set timer in seconds (timer is in minutes)
                        setTimeLeft(data.timer * 60);
                    } catch (quizErr) {
                        setError(quizErr.response?.data?.message || "Quiz not found. Please check the quiz ID or contact your teacher.");
                    }
                } else {
                    setError(err.response?.data?.message || "Error loading quiz results");
                }
            }
        };
        fetchQuiz();
    }, [quizId, user.token]);

    // Timer countdown
    useEffect(() => {
        if (!quiz || timeLeft === null || timeLeft <= 0 || results) return;

        const timerId = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerId);
                    handleAutoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft, quiz, results]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const handleAnswerChange = (questionId, selectedAnswer) => {
        setAnswers({ ...answers, [questionId]: selectedAnswer });
    };

    const handleAutoSubmit = async () => {
        setError(null);
        setLoading(true);

        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            const answersArray = Object.keys(answers).map(questionId => ({
                questionId,
                selectedAnswer: answers[questionId] || "" // Default to empty if not answered
            }));
            const { data } = await axios.post(
                "http://localhost:5000/api/quiz/attempt",
                { quizId, answers: answersArray },
                config
            );

            setResults(data);
        } catch (err) {
            setError(err.response?.data?.message || "Error submitting quiz");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        await handleAutoSubmit();
    };

    const pathnames = location.pathname.split("/").filter((x) => x);
    const breadcrumbItems = pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const displayName = value.charAt(0).toUpperCase() + value.slice(1);

        return last ? (
            <Typography key={to} color="text.primary">{displayName}</Typography>
        ) : (
            <MuiLink key={to} component={Link} to={to} underline="hover" color="inherit">
                {displayName}
            </MuiLink>
        );
    });

    const pageTitle = pathnames.length > 0 
        ? pathnames[pathnames.length - 1].charAt(0).toUpperCase() + pathnames[pathnames.length - 1].slice(1)
        : "Dashboard";

    useEffect(() => {
        document.title = `${pageTitle} - Student Dashboard - EduConnect`;
    }, [location, pageTitle]);

    return (
        <div>
            <StudentHeader 
                isSidebarCollapsed={isSidebarCollapsed}
                toggleSidebar={toggleSidebar}
                isMobile={isMobile}
            />
            
            <div className="flex min-h-screen">
                <div
                    className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 ${
                        isSidebarCollapsed ? "w-[60px]" : "w-[18%] md:w-[250px]"
                    }`}
                >
                    <StudentSidebar 
                        isCollapsed={isSidebarCollapsed} 
                        toggleSidebar={toggleSidebar} 
                    />
                </div>
        
                <div
                    className={`flex-1 transition-all duration-300 ${
                        isSidebarCollapsed ? "ml-[60px]" : "ml-[18%] md:ml-[250px]"
                    }`}
                >
                    <div
                        className={`mt-[50px] py-2 px-4 md:px-6 bg-gray-100 border-b fixed top-0 w-full z-30 transition-all duration-300 ${
                            isSidebarCollapsed 
                                ? "ml-[60px] w-[calc(100%-60px)]" 
                                : "ml-[18%] w-[calc(100%-18%)] md:ml-[250px] md:w-[calc(100%-250px)]"
                        }`}
                    >
                        <Breadcrumbs aria-label="breadcrumb">
                            <MuiLink component={Link} to="/student" underline="hover" color="inherit">
                                Student
                            </MuiLink>
                            {breadcrumbItems}
                        </Breadcrumbs>
                    </div>

                    <Box sx={{ maxWidth: 800, mx: "auto", p: 3, mt: "50px" }}>
                        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                            <Typography variant="h4" gutterBottom>Quiz Attempt</Typography>
                            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                            {results ? (
                                <Card sx={{ mt: 4, borderRadius: 2, boxShadow: 3 }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <CheckCircleOutline sx={{ color: 'success.main', mr: 1 }} />
                                            <Typography variant="h6" color="success.main">
                                                Quiz Results
                                            </Typography>
                                        </Box>
                                        <Typography variant="body1" sx={{ mb: 2 }}>
                                            Marks: {results.marks}/{results.totalMarks}
                                        </Typography>
                                        {results.answers.map((answer, index) => (
                                            <Box key={index} sx={{ mb: 3 }}>
                                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                    {index + 1}. {answer.question}
                                                </Typography>
                                                <Typography variant="body2" sx={{ ml: 2, color: answer.isCorrect ? "success.main" : "error.main" }}>
                                                    Your Answer: {answer.selectedAnswer || "Not Answered"} ({answer.isCorrect ? "Correct" : "Incorrect"})
                                                </Typography>
                                                {!answer.isCorrect && (
                                                    <Typography variant="body2" sx={{ ml: 2 }}>
                                                        Correct Answer: {answer.correctAnswer}
                                                    </Typography>
                                                )}
                                            </Box>
                                        ))}
                                    </CardContent>
                                </Card>
                            ) : quiz ? (
                                <form onSubmit={handleSubmit}>
                                    <Typography variant="body1" sx={{ mb: 2, color: timeLeft <= 30 ? "error.main" : "text.primary" }}>
                                        Time Remaining: {formatTime(timeLeft)}
                                    </Typography>
                                    {quiz.questions.map((q, index) => (
                                        <Box key={q._id} sx={{ mb: 3 }}>
                                            <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                {index + 1}. {q.question}
                                            </Typography>
                                            <FormControl component="fieldset">
                                                <RadioGroup
                                                    onChange={(e) => handleAnswerChange(q._id, e.target.value)}
                                                    value={answers[q._id] || ""}
                                                >
                                                    <FormControlLabel
                                                        value={q.options.correct}
                                                        control={<Radio />}
                                                        label={`A) ${q.options.correct}`}
                                                    />
                                                    {q.options.incorrect.map((opt, idx) => (
                                                        <FormControlLabel
                                                            key={idx}
                                                            value={opt}
                                                            control={<Radio />}
                                                            label={`${String.fromCharCode(66 + idx)}) ${opt}`}
                                                        />
                                                    ))}
                                                </RadioGroup>
                                            </FormControl>
                                        </Box>
                                    ))}
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        disabled={loading}
                                        sx={{ py: 1.5, textTransform: 'none' }}
                                    >
                                        {loading ? <CircularProgress size={24} /> : "Submit Quiz"}
                                    </Button>
                                </form>
                            ) : (
                                <Typography variant="body1" color="text.secondary">
                                    Loading quiz...
                                </Typography>
                            )}
                        </Paper>
                    </Box>
                </div>
            </div>
        </div>
    );
};

export default StudentQuiz;