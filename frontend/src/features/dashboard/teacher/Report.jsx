//frontend/src/features/dashboard/teacher/TeacherDashboard.jsx
import { useState, useEffect } from "react";
import { Breadcrumbs, Link as MuiLink, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import StudentSidebar from "../../../components/TeacherSidebar/index";
import StudentHeader from "../../../components/TeacherHeader/index";

import axios from "axios";
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
    Alert,
    Divider
} from "@mui/material";
import useAuth from "../../../hooks/useAuth";

const Report = () => {
    const { user } = useAuth();
    const [subscriptions, setSubscriptions] = useState([]);
    const [quizAttempts, setQuizAttempts] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);  
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };

            // Fetch subscribed students
            const { data: subscriptionData } = await axios.get("http://localhost:5000/api/auth/teacher/subscribed-students", config);
            setSubscriptions(subscriptionData);

            // Fetch quiz attempts
            const { data: quizData } = await axios.get("http://localhost:5000/api/auth/teacher/quiz-attempts", config);
            setQuizAttempts(quizData);
        } catch (err) {
            setError(err.response?.data?.message || "Error loading report data");
        } finally {
            setLoading(false);
        }
    };
    fetchData();
}, [user.token]);

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
            <MuiLink component={Link} to="/student" underline="hover" color="inherit">
              Student
            </MuiLink>
            {breadcrumbItems}
          </Breadcrumbs>
          </div></div>
        
          
          <div className="mt-[90px] p-4 md:p-6 overflow-y-auto h-[calc(100vh-90px)]">
          <Box sx={{ maxWidth: 1200, mx: "auto", p: 3, mt: "50px" }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h4" gutterBottom>Teacher Report</Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        {/* Subscribed Students Section */}
                        <Typography variant="h5" gutterBottom>Subscribed Students</Typography>
                        {subscriptions.length > 0 ? (
                            <TableContainer sx={{ mb: 4 }}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Student Name</TableCell>
                                            <TableCell>Email</TableCell>
                                            <TableCell>Class</TableCell>
                                            <TableCell>Fee Paid</TableCell>
                                            <TableCell>Payment Date</TableCell>
                                            <TableCell>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {subscriptions.map((sub) => (
                                            <TableRow key={sub._id}>
                                                <TableCell>{sub.userId?.name || "N/A"}</TableCell>
                                                <TableCell>{sub.userId?.email || "N/A"}</TableCell>
                                                <TableCell>{sub.classId?.subject || "N/A"}</TableCell>
                                                <TableCell>{sub.feePaid}</TableCell>
                                                <TableCell>{new Date(sub.createdAt).toLocaleDateString()}</TableCell>
                                                <TableCell>{sub.status}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                                No students subscribed to your classes.
                            </Typography>
                        )}

                        <Divider sx={{ my: 3 }} />

                        {/* Quiz Attempts Section */}
                        <Typography variant="h5" gutterBottom>Quiz Marks (Top Scores First)</Typography>
                        {quizAttempts.length > 0 ? (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Student Name</TableCell>
                                            <TableCell>Class</TableCell>
                                            <TableCell>Quiz Title</TableCell>
                                            <TableCell>Marks</TableCell>
                                            <TableCell>Total Marks</TableCell>
                                            <TableCell>Percentage</TableCell>
                                            <TableCell>Attempted At</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {quizAttempts.map((attempt) => (
                                            <TableRow key={attempt._id}>
                                                <TableCell>{attempt.studentId?.name || "N/A"}</TableCell>
                                                <TableCell>{attempt.quizId?.classId?.subject || "N/A"}</TableCell>
                                                <TableCell>{attempt.quizId?.lessonName || "N/A"}</TableCell>
                                                <TableCell>{attempt.marks}</TableCell>
                                                <TableCell>{attempt.totalMarks}</TableCell>
                                                <TableCell>{((attempt.marks / attempt.totalMarks) * 100).toFixed(2)}%</TableCell>
                                                <TableCell>{new Date(attempt.attemptedAt).toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Typography variant="body1" color="text.secondary">
                                No quiz attempts available.
                            </Typography>
                        )}
                    </>
                )}
            </Paper>
        </Box>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;