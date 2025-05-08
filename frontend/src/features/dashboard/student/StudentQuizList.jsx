import { useState, useEffect } from "react";
import axios from "axios";
import {
    Box,
    Typography,
    Paper,
    Card,
    CardContent,
    CardActions,
    Button,
    
    Alert,
    Tabs,
    Tab,
    Divider
} from "@mui/material";
import useAuth from "../../../hooks/useAuth";
import StudentSidebar from "../../../components/StudentSidebar/index";
import StudentHeader from "../../../components/StudentHeader/index";
import { Breadcrumbs, Link as MuiLink } from "@mui/material";
import { Link, useLocation } from "react-router-dom";

const StudentQuizList = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [quizzes, setQuizzes] = useState([]);
    const [history, setHistory] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [tabValue, setTabValue] = useState(0);

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
        const fetchQuizzes = async () => {
            setLoading(true);
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` }
                };
                const { data } = await axios.get("http://localhost:5000/api/quiz/student/available", config);
                setQuizzes(data);
            } catch (err) {
                setError(err.response?.data?.message || "Error loading quizzes");
            } finally {
                setLoading(false);
            }
        };

        const fetchHistory = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` }
                };
                const { data } = await axios.get("http://localhost:5000/api/quiz/student/history", config);
                setHistory(data);
            } catch (err) {
                setError(err.response?.data?.message || "Error loading quiz history");
            }
        };

        fetchQuizzes();
        fetchHistory();
    }, [user.token]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
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
                          
                            
                            <div className="p-4 md:p-6 overflow-y-auto"></div>

                    <Box sx={{ maxWidth: 800, mx: "auto", p: 3, mt: "50px" }}>
                        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                            <Typography variant="h4" gutterBottom>Quizzes</Typography>
                            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                            <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
                                <Tab label="Available Quizzes" />
                                <Tab label="Quiz History" />
                            </Tabs>
                            <Divider sx={{ mb: 3 }} />
                            {tabValue === 0 ? (
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
                                                    Duration: {quiz.timer} minutes
                                                </Typography>
                                            </CardContent>
                                            <CardActions>
                                                <Button
                                                    component={Link}
                                                    to={`/student/quizlist/quiz/${quiz._id}`}
                                                    variant="contained"
                                                    color="primary"
                                                    sx={{ textTransform: 'none' }}
                                                >
                                                    Attempt Quiz
                                                </Button>
                                            </CardActions>
                                        </Card>
                                    ))
                                ) : (
                                    <Typography variant="body1" color="text.secondary">
                                        No quizzes available. Please subscribe to a class or contact your teacher.
                                    </Typography>
                                )
                            ) : (
                                history.length > 0 ? (
                                    history.map((attempt) => (
                                        <Card key={attempt._id} sx={{ mt: 2, borderRadius: 2, boxShadow: 3 }}>
                                            <CardContent>
                                                <Typography variant="h6">
                                                    {attempt.quizId.lessonName}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Class: {attempt.quizId.classId.subject}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Marks: {attempt.marks}/{attempt.quizId.questions.length}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Attempted At: {new Date(attempt.attemptedAt).toLocaleString()}
                                                </Typography>
                                            </CardContent>
                                            <CardActions>
                                                <Button
                                                    component={Link}
                                                    to={`/student/quizlist/quiz/${attempt.quizId._id}`}
                                                    variant="outlined"
                                                    color="primary"
                                                    sx={{ textTransform: 'none' }}
                                                >
                                                    View Results
                                                </Button>
                                            </CardActions>
                                        </Card>
                                    ))
                                ) : (
                                    <Typography variant="body1" color="text.secondary">
                                        No quiz history available.
                                    </Typography>
                                )
                            )}
                        </Paper>
                    </Box>
                </div>
            </div>
        </div>
    );
};

export default StudentQuizList;