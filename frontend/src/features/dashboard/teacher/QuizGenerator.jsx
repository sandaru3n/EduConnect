//frontend/src/features/dashboard/teacher/QuizGenerator.jsx
import { useState, useEffect } from "react";
import { Breadcrumbs, Link as MuiLink, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import StudentSidebar from "../../../components/TeacherSidebar/index";
import StudentHeader from "../../../components/TeacherHeader/index";
import axios from "axios";
import {
    Box,
    TextField,
    Button,
    Paper,
    Card,
    CardContent,
    CardActions,
    CircularProgress,
    Alert,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Divider,
    Tabs,
    Tab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions
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
    const [quizzes, setQuizzes] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editQuizId, setEditQuizId] = useState(null);
    const [editTimer, setEditTimer] = useState("");
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
    const [deleteQuizId, setDeleteQuizId] = useState(null);
    const [tabValue, setTabValue] = useState(0);

  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  useEffect(() => {
    const handleResize = () => {
      const mobileView = window.innerWidth <= 768;
      setIsMobile(mobileView);
      setIsSidebarCollapsed(mobileView); // Auto-collapse on mobile
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const pathnames = location.pathname.split("/").filter((x) => x);
  const breadcrumbItems = pathnames.map((value, index) => {
    const last = index === pathnames.length - 1;
    const to = `/${pathnames.slice(0, index + 1).join("/")}`;
    const displayName = value.charAt(0).toUpperCase() + value.slice(1);

    return last ? (
      <Typography key={to} color="text.primary">
        {displayName}
      </Typography>
    ) : (
      <MuiLink
        key={to}
        component={Link}
        to={to}
        underline="hover"
        color="inherit"
      >
        {displayName}
      </MuiLink>
    );
  });

  // Get the current page name for the tab title
  const pageTitle = pathnames.length > 0 
    ? pathnames[pathnames.length - 1].charAt(0).toUpperCase() + pathnames[pathnames.length - 1].slice(1)
    : "Dashboard"; // Default title if no pathnames

  // Update document title when location changes
  useEffect(() => {
    document.title = `TeacherDashboard - EduConnect`; // You can customize the format
  }, [location, pageTitle]);

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

    const fetchQuizzes = async () => {
        setLoading(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            const { data } = await axios.get("http://localhost:5000/api/quiz/teacher/history", config);
            setQuizzes(data);
        } catch (err) {
            setError(err.response?.data?.message || "Error loading quiz history");
        } finally {
            setLoading(false);
        }
    };

    fetchClasses();
    fetchQuizzes();
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
        // Refresh quiz history
        const { data: updatedQuizzes } = await axios.get("http://localhost:5000/api/quiz/teacher/history", config);
        setQuizzes(updatedQuizzes);
        setLessonName("");
        setClassId("");
        setNumberOfQuestions(10);
        setTimer(30);
    } catch (err) {
        setError(err.response?.data?.message || "Error generating quiz");
    } finally {
        setLoading(false);
    }
};

const handleEditTimer = (quiz) => {
    setEditQuizId(quiz._id);
    setEditTimer(quiz.timer);
};

const handleSaveTimer = async () => {
    setError(null);
    try {
        const config = {
            headers: { Authorization: `Bearer ${user.token}` }
        };
        const { data } = await axios.put(
            "http://localhost:5000/api/quiz/update-timer",
            { quizId: editQuizId, timer: parseInt(editTimer) },
            config
        );
        setQuizzes(quizzes.map(q => q._id === editQuizId ? { ...q, timer: data.quiz.timer } : q));
        setEditQuizId(null);
        setEditTimer("");
    } catch (err) {
        setError(err.response?.data?.message || "Error updating quiz timer");
    }
};

const handleDeleteQuiz = async () => {
    setError(null);
    try {
        const config = {
            headers: { Authorization: `Bearer ${user.token}` }
        };
        await axios.delete(`http://localhost:5000/api/quiz/${deleteQuizId}`, config);
        setQuizzes(quizzes.filter(q => q._id !== deleteQuizId));
        setOpenDeleteConfirm(false);
        setDeleteQuizId(null);
    } catch (err) {
        setError(err.response?.data?.message || "Error deleting quiz");
    }
};

const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
};

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
            {/* Breadcrumbs */}
        <div
          className={`mt-[50px] py-2 px-4 md:px-6 bg-gray-100 border-b transition-all duration-300 z-30 fixed top-0 left-0 w-full ${
            isSidebarCollapsed
              ? "ml-[60px] w-[calc(100%-60px)]"
              : "ml-[18%] w-[calc(100%-18%)] md:ml-[250px] md:w-[calc(100%-250px)]"
          }`}
        >
          <Breadcrumbs aria-label="breadcrumb">
            {breadcrumbItems}
          </Breadcrumbs>
          </div></div>
        
          
          <div className=" p-4 md:p-6 overflow-y-auto ">
          <Box sx={{ maxWidth: 800, mx: "auto", p: 3, mt: "50px" }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h4" gutterBottom>Quiz Generator</Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
                    <Tab label="Generate Quiz" />
                    <Tab label="Quiz History" />
                </Tabs>
                <Divider sx={{ mb: 3 }} />
                {tabValue === 0 ? (
                    <>
                        <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
                            Enter the lesson details to generate multiple-choice questions (MCQs) using AI.
                        </Typography>
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
                    </>
                ) : (
                    loading ? (
                        <Typography variant="body1" color="text.secondary">
                            Loading quizzes...
                        </Typography>
                    ) : quizzes.length > 0 ? (
                        quizzes.map((quiz) => (
                            <Card key={quiz._id} sx={{ mt: 2, borderRadius: 2, boxShadow: 3 }}>
                                <CardContent>
                                    <Typography variant="h6">
                                        {quiz.lessonName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Class: {quiz.classId.subject}
                                    </Typography>
                                    {editQuizId === quiz._id ? (
                                        <TextField
                                            label="Timer (minutes)"
                                            type="number"
                                            value={editTimer}
                                            onChange={(e) => setEditTimer(e.target.value)}
                                            inputProps={{ min: 1 }}
                                            sx={{ mt: 1 }}
                                        />
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            Duration: {quiz.timer} minutes
                                        </Typography>
                                    )}
                                    <Typography variant="body2" color="text.secondary">
                                        Created At: {new Date(quiz.createdAt).toLocaleString()}
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    {editQuizId === quiz._id ? (
                                        <>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={handleSaveTimer}
                                                sx={{ textTransform: 'none' }}
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                color="secondary"
                                                onClick={() => setEditQuizId(null)}
                                                sx={{ textTransform: 'none' }}
                                            >
                                                Cancel
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => handleEditTimer(quiz)}
                                                sx={{ textTransform: 'none' }}
                                            >
                                                Edit Timer
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                onClick={() => {
                                                    setDeleteQuizId(quiz._id);
                                                    setOpenDeleteConfirm(true);
                                                }}
                                                sx={{ textTransform: 'none' }}
                                            >
                                                Delete
                                            </Button>
                                        </>
                                    )}
                                </CardActions>
                            </Card>
                        ))
                    ) : (
                        <Typography variant="body1" color="text.secondary">
                            No quizzes created yet.
                        </Typography>
                    )
                )}
            </Paper>

            <Dialog open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)}>
                <DialogTitle>Delete Quiz</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this quiz? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDeleteConfirm(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteQuiz} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
        </div></div></div></div>
    );
};

export default QuizGenerator ;

