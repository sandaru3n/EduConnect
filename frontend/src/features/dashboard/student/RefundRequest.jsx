import StudentSidebar from "../../../components/StudentSidebar/index";
import StudentHeader from "../../../components/StudentHeader/index";
import { Typography } from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, MenuItem, Select, FormControl, InputLabel } from "@mui/material";

const RefundRequest = () => {
    const [classes, setClasses] = useState([]);
    const [classId, setClassId] = useState("");
    const [reason, setReason] = useState("");
    const navigate = useNavigate();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

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
        document.title = `Refund Request - Student Dashboard - EduConnect`;
    }, []);

    return (
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
                    <div className="flex-1 flex items-center justify-center pt-[80px] px-4 md:px-8">
                        <Box 
                            sx={{ 
                                p: 8, 
                                bgcolor: "white", 
                                borderRadius: 3, 
                                boxShadow: 4, 
                                maxWidth: 700,
                                width: "100%",
                                mx: "auto"
                            }}
                            className="border border-indigo-100"
                        >
                            <Typography 
                                variant="h4" 
                                gutterBottom 
                                sx={{ fontWeight: "bold" }} 
                                className="text-indigo-700 mb-6"
                            >
                                Request a Refund
                            </Typography>
                            <form onSubmit={handleSubmit}>
                                <FormControl fullWidth sx={{ mb: 4 }}>
                                    <InputLabel className="text-teal-600">Select Class</InputLabel>
                                    <Select 
                                        value={classId} 
                                        onChange={(e) => setClassId(e.target.value)} 
                                        required
                                        className="border-teal-300 focus:border-teal-500"
                                    >
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
                                    rows={6}
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    required
                                    sx={{ mb: 4 }}
                                    className="border-indigo-300 focus:border-indigo-500"
                                />
                                <Button 
                                    type="submit" 
                                    variant="contained" 
                                    fullWidth
                                    className="bg-teal-600 hover:bg-teal-700 py-3 text-lg"
                                >
                                    Submit Refund Request
                                </Button>
                            </form>
                        </Box>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default RefundRequest;