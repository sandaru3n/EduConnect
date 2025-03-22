// frontend/src/features/student/ActiveTeachers.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Box, Typography, Card, CardContent, Button, CircularProgress, Alert, Collapse, Grid
} from "@mui/material";
import PaymentModal from "../../../components/PaymentModal";

const ActiveTeachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [classes, setClasses] = useState([]);
    const [classesLoading, setClassesLoading] = useState(false);
    const [classesError, setClassesError] = useState(null);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState(null);

    // Fetch active teachers on mount
    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem("userInfo"));
                if (!userInfo || !userInfo.token) {
                    throw new Error("User not authenticated");
                }
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get("http://localhost:5000/api/student/teachers", config);
                setTeachers(data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to fetch teachers");
                setLoading(false);
            }
        };
        fetchTeachers();
    }, []);

    // Fetch classes for a specific teacher
    const fetchClassesForTeacher = async (teacherId) => {
        setClassesLoading(true);
        setClassesError(null);
        try {
            const { data } = await axios.get(`http://localhost:5000/api/classes/teacher/${teacherId}`);
            setClasses(data);
            setSelectedTeacher(teacherId);
        } catch (err) {
            setClassesError("Failed to fetch classes");
        } finally {
            setClassesLoading(false);
        }
    };

    // Toggle classes visibility
    const handleSeeClasses = (teacherId) => {
        if (selectedTeacher === teacherId) {
            setSelectedTeacher(null);
            setClasses([]);
        } else {
            fetchClassesForTeacher(teacherId);
        }
    };

    // Open payment modal
    const handlePayClassFee = (classId) => {
        setSelectedClassId(classId);
        setPaymentModalOpen(true);
    };

    // Handle payment submission
    const handlePaymentSubmit = async (paymentData) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.post("http://localhost:5000/api/payments/subscribe", {
                classId: paymentData.classId,
                cardNumber: paymentData.cardNumber,
                expiryDate: paymentData.expiryDate,
                cvv: paymentData.cvv,
            }, config);
            alert("Subscription successful!");
            // Optionally refresh or update UI here
        } catch (err) {
            throw new Error(err.response?.data?.message || "Payment failed");
        }
    };

    if (loading) {
        return <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}><Alert severity="error">{error}</Alert></Box>;
    }

    return (
        <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Active Teachers
            </Typography>
            <Grid container spacing={3}>
                {teachers.map((teacher) => (
                    <Grid item xs={12} sm={6} md={4} key={teacher._id}>
                        <Card sx={{ height: "100%" }}>
                            <CardContent>
                                <Typography variant="h6">{teacher.name}</Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {teacher.email}
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleSeeClasses(teacher._id)}
                                    sx={{ mt: 2 }}
                                >
                                    {selectedTeacher === teacher._id ? "Hide Classes" : "See Classes"}
                                </Button>
                                <Collapse in={selectedTeacher === teacher._id}>
                                    {classesLoading ? (
                                        <CircularProgress size={24} sx={{ mt: 2 }} />
                                    ) : classesError ? (
                                        <Alert severity="error" sx={{ mt: 2 }}>{classesError}</Alert>
                                    ) : classes.length === 0 ? (
                                        <Typography sx={{ mt: 2 }}>No classes found.</Typography>
                                    ) : (
                                        <Box sx={{ mt: 2 }}>
                                            {classes.map((cls) => (
                                                <Box key={cls._id} sx={{ mb: 2, p: 2, border: "1px solid #e0e0e0", borderRadius: 1 }}>
                                                    <Typography variant="subtitle1">{cls.subject}</Typography>
                                                    <Typography variant="body2">{cls.description}</Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        Monthly Fee: ${cls.monthlyFee}
                                                    </Typography>
                                                    <Button
                                                        variant="contained"
                                                        color="secondary"
                                                        onClick={() => handlePayClassFee(cls._id)}
                                                        sx={{ mt: 1 }}
                                                    >
                                                        Pay Class Fee
                                                    </Button>
                                                </Box>
                                            ))}
                                        </Box>
                                    )}
                                </Collapse>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            <PaymentModal
                open={paymentModalOpen}
                onClose={() => setPaymentModalOpen(false)}
                onSubmit={handlePaymentSubmit}
                classId={selectedClassId}
            />
        </Box>
    );
};

export default ActiveTeachers;