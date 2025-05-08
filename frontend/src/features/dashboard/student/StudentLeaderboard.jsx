import { useState, useEffect } from "react";
import { Breadcrumbs, Link as MuiLink, Typography, Button } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import StudentSidebar from "../../../components/StudentSidebar/index";
import StudentHeader from "../../../components/StudentHeader/index";
import axios from "axios";
import { motion } from "framer-motion";
import useAuth from "../../../hooks/useAuth";
import { Trophy, Award, Calendar } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { createTheme, ThemeProvider } from "@mui/material"; // Added createTheme import

// Create a custom MUI theme to apply the Roboto font globally
const theme = createTheme({
    typography: {
        fontFamily: 'Roboto, sans-serif',
        h4: {
            fontWeight: 600,
            color: '#1a202c',
        },
        body1: {
            fontWeight: 400,
            color: '#6b7280',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 8,
                    padding: '8px 16px',
                    fontWeight: 500,
                    fontSize: '1rem',
                    '&:hover': {
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    },
                },
            },
        },
    },
});

const StudentLeaderboard = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [leaderboardData, setLeaderboardData] = useState([]);

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

    // Fetch student leaderboard data
    useEffect(() => {
        const fetchLeaderboardData = async () => {
            setLoading(true);
            setError(null);
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` }
                };

                const { data } = await axios.get("http://localhost:5000/api/quiz/leaderboard/student", config);
                console.log("Leaderboard Data:", data); // Debug: Log the raw data
                setLeaderboardData(data);
            } catch (error) {
                console.error("Error fetching leaderboard data:", error);
                setError("Failed to load leaderboard data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchLeaderboardData();
    }, [user.token]);

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
                    fontSize: { xs: '0.85rem', md: '0.875rem' },
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
                    fontSize: { xs: '0.85rem', md: '0.875rem' },
                    '&:hover': {
                        textDecoration: 'underline',
                    },
                }}
            >
                {displayName}
            </MuiLink>
        );
    });

    const pageTitle = pathnames.length > 0
        ? pathnames[pathnames.length - 1].charAt(0).toUpperCase() + pathnames[pathnames.length - 1].slice(1).replace(/-/g, ' ')
        : "Leaderboard";

    useEffect(() => {
        document.title = `${pageTitle} - EduConnect`;
    }, [location, pageTitle]);

    // Helper function to format dates safely
    const formatDate = (dateString) => {
        if (!dateString) {
            console.warn("Missing dateString:", dateString); // Debug: Log missing date
            return "Not Available";
        }
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            console.warn("Invalid dateString:", dateString); // Debug: Log invalid date
            return "Not Available";
        }
        return date.toLocaleDateString();
    };

    // Generate PDF using jsPDF and jspdf-autotable
    const generatePDF = () => {
        const doc = new jsPDF();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("Student Leaderboard Rankings", 14, 20);
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
        doc.text(`Student: ${user.name}`, 14, 40);

        let yOffset = 50;

        leaderboardData.forEach((lesson, index) => {
            // Lesson Title
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.text(`${lesson.lessonName} Leaderboard`, 14, yOffset);
            yOffset += 10;

            // Student's Ranking
            doc.setFont("helvetica", "normal");
            doc.setFontSize(12);
            doc.text("Your Ranking:", 14, yOffset);
            yOffset += 10;

            doc.autoTable({
                startY: yOffset,
                head: [['Rank', 'Marks', 'Total Marks', 'Percentage']],
                body: [
                    [
                        lesson.studentRank || 'N/A',
                        lesson.studentMarks || 'N/A',
                        lesson.studentTotalMarks || 'N/A',
                        `${lesson.studentPercentage || 'N/A'}%`
                    ]
                ],
                theme: 'striped',
                headStyles: { fillColor: [59, 130, 246] },
                styles: { fontSize: 10 },
            });

            yOffset = doc.lastAutoTable.finalY + 10;

            // Top 3 Students
            doc.setFont("helvetica", "normal");
            doc.setFontSize(12);
            doc.text("Top 3 Students:", 14, yOffset);
            yOffset += 10;

            if (lesson.topStudents.length === 0) {
                doc.text("No attempts yet for this lesson.", 14, yOffset);
                yOffset += 10;
            } else {
                const topStudentsTable = lesson.topStudents.map(student => [
                    student.rank || 'N/A',
                    student.studentName || 'N/A',
                    `${student.marks || 'N/A'}/${student.totalMarks || 'N/A'}`,
                    `${student.percentage || 'N/A'}%`,
                    formatDate(student.attemptDate)
                ]);

                doc.autoTable({
                    startY: yOffset,
                    head: [['Rank', 'Student Name', 'Marks', 'Percentage', 'Attempt Date']],
                    body: topStudentsTable,
                    theme: 'striped',
                    headStyles: { fillColor: [59, 130, 246] },
                    styles: { fontSize: 10 },
                });

                yOffset = doc.lastAutoTable.finalY + 20;
            }

            // Add a page break if not the last lesson
            if (index < leaderboardData.length - 1) {
                doc.addPage();
                yOffset = 20;
            }
        });

        doc.save(`Leaderboard_${user.name}_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`);
    };

    return (
        
            <div className="min-h-screen bg-gray-100">
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
                                {location.pathname === "/student/leaderboard" ? (
                                    <Typography
                                        sx={{
                                            color: '#1f2937',
                                            fontWeight: 'medium',
                                            fontSize: { xs: '0.85rem', md: '0.875rem' },
                                        }}
                                    >
                                        Leaderboard
                                    </Typography>
                                ) : (
                                    <>
                                        <MuiLink
                                            component={Link}
                                            to="/student"
                                            underline="none"
                                            sx={{
                                                color: '#3b82f6',
                                                fontWeight: 500,
                                                fontSize: { xs: '0.85rem', md: '0.875rem' },
                                                '&:hover': {
                                                    textDecoration: 'underline',
                                                },
                                            }}
                                        >
                                            Home
                                        </MuiLink>
                                        {breadcrumbItems}
                                    </>
                                )}
                            </Breadcrumbs>
                        </div>

                        <div className="mt-[104px] p-6 md:p-8 overflow-y-auto h-[calc(100vh-104px)]">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="max-w-[1400px] mx-auto space-y-10"
                            >
                                <div className="flex justify-between items-center">
                                    <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">
                                        Your Leaderboard Rankings
                                    </h1>
                                    {!loading && leaderboardData.length > 0 && (
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={generatePDF}
                                                sx={{
                                                    bgcolor: '#3b82f6',
                                                    '&:hover': {
                                                        bgcolor: '#2563eb',
                                                    },
                                                    px: 4,
                                                    py: 1.5,
                                                }}
                                            >
                                                Download PDF
                                            </Button>
                                        </motion.div>
                                    )}
                                </div>

                                {error ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-red-600 bg-red-50 p-4 rounded-lg text-center shadow-md"
                                    >
                                        {error}
                                    </motion.div>
                                ) : loading ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center text-indigo-600 font-semibold flex justify-center"
                                    >
                                        <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </motion.div>
                                ) : leaderboardData.length === 0 ? (
                                    <p className="text-center text-gray-500 text-lg">No leaderboard data available. Take some quizzes to see your rankings!</p>
                                ) : (
                                    <div className="space-y-8">
                                        {leaderboardData.map((lesson, index) => (
                                            <motion.div
                                                key={lesson.lessonName}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.5, delay: index * 0.2 }}
                                                className="bg-white p-6 rounded-2xl shadow-lg"
                                            >
                                                <div className="flex items-center justify-between mb-4">
                                                    <h2 className="text-2xl font-bold text-gray-800">{lesson.lessonName} Leaderboard</h2>
                                                    <Trophy className="w-8 h-8 text-amber-500" />
                                                </div>

                                                <div className="space-y-6">
                                                    {/* Student's Ranking */}
                                                    <div className="bg-indigo-50 p-4 rounded-xl shadow-md">
                                                        <h3 className="text-lg font-semibold text-indigo-800 mb-2">Your Ranking</h3>
                                                        <div className="flex items-center space-x-4">
                                                            <div className="flex items-center">
                                                                <Award className={`w-6 h-6 mr-2 ${lesson.studentRank === 1 ? 'text-amber-500' : lesson.studentRank === 2 ? 'text-gray-400' : lesson.studentRank === 3 ? 'text-amber-600' : 'text-gray-600'}`} />
                                                                <p className="text-lg font-bold text-gray-800">Rank: {lesson.studentRank}</p>
                                                            </div>
                                                            <p className="text-gray-600">Marks: {lesson.studentMarks}/{lesson.studentTotalMarks}</p>
                                                            <p className="text-gray-600">Percentage: {lesson.studentPercentage}%</p>
                                                        </div>
                                                    </div>

                                                    {/* Top 3 Students */}
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 3 Students</h3>
                                                        {lesson.topStudents.length === 0 ? (
                                                            <p className="text-gray-500">No attempts yet for this lesson.</p>
                                                        ) : (
                                                            <div className="space-y-3">
                                                                {lesson.topStudents.map((topStudent, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        className={`flex items-center justify-between p-3 rounded-lg ${
                                                                            idx === 0 ? 'bg-amber-100' : idx === 1 ? 'bg-gray-100' : 'bg-amber-50'
                                                                        }`}
                                                                    >
                                                                        <div className="flex items-center">
                                                                            <Award className={`w-5 h-5 mr-2 ${idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-gray-400' : 'text-amber-600'}`} />
                                                                            <p className="text-sm font-medium text-gray-800">{topStudent.rank}. {topStudent.studentName}</p>
                                                                        </div>
                                                                        <div className="flex items-center space-x-4">
                                                                            <p className="text-sm text-gray-600">Marks: {topStudent.marks}/{topStudent.totalMarks}</p>
                                                                            <p className="text-sm text-gray-600">Percentage: {topStudent.percentage}%</p>
                                                                            <p className="text-sm text-gray-600 flex items-center">
                                                                                <Calendar className="w-4 h-4 mr-1 text-gray-500" />
                                                                                {formatDate(topStudent.attemptDate)}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        
    );
};

export default StudentLeaderboard;