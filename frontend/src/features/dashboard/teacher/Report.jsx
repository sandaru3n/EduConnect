import { useState, useEffect } from "react";
import axios from "axios";
import {
    Box,
    Typography,
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

    return (
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
    );
};

export default Report;