import StudentSidebar from "../../../components/StudentSidebar/index";
import StudentHeader from "../../../components/StudentHeader/index";
import { Breadcrumbs, Link as MuiLink, Typography, Box, Paper, Alert, List, ListItem, ListItemText, createTheme, ThemeProvider, LinearProgress } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import useAuth from "../../../hooks/useAuth";
import { motion } from "framer-motion";
import { HiAcademicCap, HiLightBulb } from "react-icons/hi";

// Create a custom MUI theme to apply the Roboto font globally
const theme = createTheme({
    typography: {
        fontFamily: 'Roboto, sans-serif',
        h4: {
            fontWeight: 600,
            color: '#1a202c',
        },
        h6: {
            fontWeight: 600,
            color: '#1a202c',
        },
        body1: {
            fontWeight: 400,
            color: '#6b7280',
        },
        body2: {
            fontWeight: 400,
            color: '#6b7280',
        },
    },
    components: {
        MuiListItemText: {
            styleOverrides: {
                primary: {
                    fontFamily: 'Roboto, sans-serif',
                    fontWeight: 500,
                    color: '#1a202c',
                },
                secondary: {
                    fontFamily: 'Roboto, sans-serif',
                    color: '#6b7280',
                },
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    height: 8,
                    borderRadius: 4,
                },
                bar: {
                    borderRadius: 4,
                },
            },
        },
    },
});

const StudentDashboard = () => {
    const { user } = useAuth();
    const [learningPath, setLearningPath] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const fetchLearningPath = async () => {
            setLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get("http://localhost:5000/api/quiz/student/learning-path", config);
                setLearningPath(data.learningPath);
            } catch (err) {
                setError(err.response?.data?.message || "Error loading personalized learning path");
            } finally {
                setLoading(false);
            }
        };
        fetchLearningPath();
    }, [user.token]);

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
        if (typeof document !== 'undefined') {
            document.title = `Student Dashboard - EduConnect`;
        }
    }, []);

    const pathnames = location.pathname.split("/").filter((x) => x);
    const breadcrumbItems = pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const displayName = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');

        return last ? (
            <Typography
                key={to}
                sx={{
                    color: '#1f2937',
                    fontWeight: 'medium',
                    fontSize: { xs: '0.9rem', md: '1rem' },
                }}
            >
                {displayName}
            </Typography>
        ) : (
            <MuiLink
                key={to}
                component={Link}
                to={to}
                underline="none"
                sx={{
                    color: '#3b82f6',
                    fontWeight: 500,
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    '&:hover': {
                        textDecoration: 'underline',
                    },
                }}
            >
                {displayName}
            </MuiLink>
        );
    });

    return (
        <ThemeProvider theme={theme}>
            <div className="flex flex-col min-h-screen bg-gray-50">
                <StudentHeader 
                    isSidebarCollapsed={isSidebarCollapsed}
                    toggleSidebar={toggleSidebar}
                    isMobile={isMobile}
                />
                
                <div className="flex flex-1 overflow-hidden">
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

                    <main
                        className={`flex-1 transition-all duration-300 ${
                            isSidebarCollapsed ? "ml-[60px]" : "ml-[20%] md:ml-[280px]"
                        } flex flex-col`}
                    >
                        <div
                            className={`py-3 px-4 md:px-6 fixed top-[64px] right-2 z-30 transition-all duration-300 ${
                                isSidebarCollapsed ? "ml-[60px] w-[calc(100%-60px)]" : "ml-[18%] w-[calc(100%-18%)] md:ml-[250px] md:w-[calc(100%-250px)]"
                            } bg-white border-b border-gray-200 shadow-sm`}
                        >
                            <Breadcrumbs
                                aria-label="breadcrumb"
                                separator={<span className="text-gray-400 mx-1">{'>'}</span>}
                                sx={{
                                    '& .MuiBreadcrumbs-ol': {
                                        alignItems: 'center',
                                    },
                                }}
                            >
                                {breadcrumbItems}
                            </Breadcrumbs>
                        </div>

                        <div className="mt-[120px] p-4 md:p-6 overflow-y-auto h-[calc(100vh-120px)]">
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="max-w-4xl mx-auto"
                            >
                                <Paper elevation={3} sx={{ p: 4, borderRadius: 2, bgcolor: '#fff', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)' }}>
                                    <div className="flex items-center gap-3 mb-6">
                                        <HiAcademicCap className="w-8 h-8 text-blue-600" />
                                        <Typography variant="h4" gutterBottom>
                                            Personalized Learning Path
                                        </Typography>
                                    </div>
                                    {error && (
                                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2, fontSize: '1rem' }}>
                                            {error}
                                        </Alert>
                                    )}
                                    {loading ? (
                                        <div className="flex justify-center py-4">
                                            <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                            </svg>
                                        </div>
                                    ) : learningPath ? (
                                        <Box>
                                            <Typography variant="body1" sx={{ mb: 2, fontWeight: 600, color: '#1a202c', fontSize: '1rem' }}>
                                                Summary:
                                            </Typography>
                                            <Typography variant="body1" sx={{ mb: 4, color: '#6b7280', fontSize: '1rem' }}>
                                                {learningPath.summary}
                                            </Typography>
                                            {learningPath.focusAreas.length > 0 ? (
                                                <>
                                                    <Typography variant="body1" sx={{ mb: 2, fontWeight: 600, color: '#1a202c', fontSize: '1rem' }}>
                                                        Focus Areas:
                                                    </Typography>
                                                    <List>
                                                        {learningPath.focusAreas.map((area, index) => (
                                                            <motion.div
                                                                key={index}
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: index * 0.1 }}
                                                            >
                                                                <ListItem sx={{ flexDirection: "column", alignItems: "flex-start", bgcolor: '#f9fafb', borderRadius: 2, mb: 2, p: 3, boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)' }}>
                                                                    <ListItemText
                                                                        primary={
                                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                                                                <Typography sx={{ fontWeight: 600, color: '#1a202c', fontSize: '1rem' }}>
                                                                                    {area.topic} ({area.subject})
                                                                                </Typography>
                                                                                <Typography sx={{ fontWeight: 600, color: '#3b82f6', fontSize: '1rem' }}>
                                                                                    {area.percentage}%
                                                                                </Typography>
                                                                            </Box>
                                                                        }
                                                                        secondary={
                                                                            <>
                                                                                <Box sx={{ width: '100%', mt: 1, mb: 2 }}>
                                                                                    <LinearProgress 
                                                                                        variant="determinate" 
                                                                                        value={area.percentage} 
                                                                                        sx={{ 
                                                                                            bgcolor: '#e5e7eb', 
                                                                                            '& .MuiLinearProgress-bar': { 
                                                                                                bgcolor: area.percentage >= 70 ? '#22c55e' : area.percentage >= 40 ? '#f59e0b' : '#ef4444' 
                                                                                            } 
                                                                                        }} 
                                                                                    />
                                                                                </Box>
                                                                                <Typography variant="body2" component="span" sx={{ fontWeight: 600, color: '#1a202c', fontSize: '1rem' }}>
                                                                                    Recommendations:
                                                                                </Typography>
                                                                                <ul className="list-disc list-inside mt-1">
                                                                                    {area.recommendations.map((rec, idx) => (
                                                                                        <li key={idx} className="text-gray-600 text-base">{rec}</li>
                                                                                    ))}
                                                                                </ul>
                                                                            </>
                                                                        }
                                                                    />
                                                                </ListItem>
                                                            </motion.div>
                                                        ))}
                                                    </List>
                                                </>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '1rem' }}>
                                                    No focus areas identified. Keep up the good work!
                                                </Typography>
                                            )}
                                            <Box sx={{ mt: 4, p: 3, bgcolor: '#e0f2fe', borderRadius: 2, border: '1px solid #bae6fd' }}>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <HiLightBulb className="w-6 h-6 text-blue-600" />
                                                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#1a202c', fontSize: '1rem' }}>
                                                        Motivation:
                                                    </Typography>
                                                </div>
                                                <Typography variant="body1" sx={{ color: '#1a202c', fontStyle: 'italic', fontSize: '1rem' }}>
                                                    "{learningPath.motivation}"
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ) : (
                                        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem' }}>
                                            No learning path available. Please attempt some quizzes to generate a personalized learning path.
                                        </Typography>
                                    )}
                                </Paper>
                            </motion.div>
                        </div>
                    </main>
                </div>
            </div>
        </ThemeProvider>
    );
};

export default StudentDashboard;