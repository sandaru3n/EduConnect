// frontend/src/features/dashboard/student/RefundRequest.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Box, Typography, TextField, Button, MenuItem, Select, FormControl, InputLabel } from "@mui/material";

const RefundRequest = () => {
    const [classes, setClasses] = useState([]);
    const [classId, setClassId] = useState("");
    const [reason, setReason] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClasses = async () => {
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get("http://localhost:5000/api/subscriptions/my-classes", config);
            setClasses(data);
        };
        fetchClasses();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.post("http://localhost:5000/api/refunds/request", { classId, reason }, config);
            alert("Refund request submitted successfully!");
            navigate("/student/dashboard/refund-history");
        } catch (error) {
            console.error("Refund request error:", error);
            alert("Failed to submit refund request: " + (error.response?.data?.message || "Please try again"));
        }
    };

    return (
        <Box sx={{ p: 6, bgcolor: "white", borderRadius: 2, boxShadow: 3, maxWidth: 600, mx: "auto", mt: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", color: "#333" }}>
                Request a Refund
            </Typography>
            <form onSubmit={handleSubmit}>
                <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Select Class</InputLabel>
                    <Select value={classId} onChange={(e) => setClassId(e.target.value)} required>
                        <MenuItem value="">-- Select a Class --</MenuItem>
                        {classes.map((cls) => (
                            <MenuItem key={cls._id} value={cls._id}>{cls.subject}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    fullWidth
                    label="Reason for Refund"
                    multiline
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    sx={{ mb: 3 }}
                />
                <Button type="submit" variant="contained" color="primary" fullWidth>
                    Submit Refund Request
                </Button>
            </form>
        </Box>
    );
};

export default RefundRequest;