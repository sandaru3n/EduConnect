import StudentSidebar from "../../../components/StudentSidebar/index";
import StudentHeader from "../../../components/StudentHeader/index";
import { Typography, Breadcrumbs, Link as MuiLink, Snackbar, Alert } from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Box, TextField, Button, MenuItem, Select, FormControl, InputLabel, Input } from "@mui/material";

const RefundRequest = () => {
    const [classes, setClasses] = useState([]);
    const [classId, setClassId] = useState("");
    const [reason, setReason] = useState("");
    const [proof, setProof] = useState(null); // State for proof file
    const [successMessage, setSuccessMessage] = useState(""); // For success message
    const [successOpen, setSuccessOpen] = useState(false); // For success snackbar
    const navigate = useNavigate();
    const location = useLocation();
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
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            const formData = new FormData();
            formData.append('classId', classId);
            formData.append('reason', reason);
            if (proof) {
                formData.append('proof', proof);
            }

            await axios.post("http://localhost:5000/api/refunds/request", formData, config);
            setSuccessMessage("Refund request submitted successfully!");
            setSuccessOpen(true);
            setTimeout(() => {
                navigate("/student/dashboard/refund-history");
            }, 2000); // Navigate after 2 seconds to allow the user to see the success message
        } catch (error) {
            console.error("Refund request error:", error);
            setSuccessMessage("Failed to submit refund request: " + (error.response?.data?.message || "Please try again"));
            setSuccessOpen(true);
        }
    };

    const handleSuccessClose = () => {
        setSuccessOpen(false);
        setSuccessMessage("");
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

                    <div className="flex-1 flex items-center justify-center pt-[120px] px-4 md:px-8">
                        <Box 
                            sx={{ 
                                p: { xs: 4, md: 6 }, // Reduced padding for smaller screens
                                bgcolor: "white", 
                                borderRadius: 2, 
                                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)", // Softer shadow
                                maxWidth: 600, // Slightly narrower for a focused look
                                width: "100%",
                                mx: "auto",
                                transition: "all 0.3s ease-in-out"
                            }}
                            className="border border-gray-100"
                        >
                            <Typography 
                                variant="h5" // Slightly smaller heading
                                gutterBottom 
                                sx={{ 
                                    fontWeight: 600, 
                                    color: '#1a202c', // Darker gray for better contrast
                                    mb: 4 // Increased margin-bottom for spacing
                                }}
                            >
                                Request a Refund
                            </Typography>
                            <form onSubmit={handleSubmit}>
                                <FormControl fullWidth sx={{ mb: 3 }}>
                                    <InputLabel sx={{ color: '#6b7280', fontWeight: 500 }}>Select Class</InputLabel>
                                    <Select 
                                        value={classId} 
                                        onChange={(e) => setClassId(e.target.value)} 
                                        required
                                        sx={{
                                            bgcolor: '#f9fafb',
                                            borderRadius: 1,
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#e5e7eb',
                                            },
                                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#d1d5db',
                                            },
                                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                borderColor: '#3b82f6',
                                            },
                                        }}
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
                                    rows={5} // Slightly shorter textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    required
                                    sx={{ 
                                        mb: 3,
                                        bgcolor: '#f9fafb',
                                        borderRadius: 1,
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': {
                                                borderColor: '#e5e7eb',
                                            },
                                            '&:hover fieldset': {
                                                borderColor: '#d1d5db',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#3b82f6',
                                            },
                                        },
                                        '& .MuiInputLabel-root': {
                                            color: '#6b7280',
                                            fontWeight: 500,
                                        },
                                    }}
                                />
                                <Box sx={{ mb: 3 }}>
                                    <InputLabel htmlFor="proof-upload" sx={{ color: '#6b7280', fontWeight: 500, mb: 1 }}>
                                        Upload Proof (JPG or PNG)
                                    </InputLabel>
                                    <Input
                                        id="proof-upload"
                                        type="file"
                                        accept="image/jpeg,image/png"
                                        onChange={(e) => setProof(e.target.files[0])}
                                        sx={{
                                            bgcolor: '#f9fafb',
                                            borderRadius: 1,
                                            p: 1,
                                            border: '1px solid #e5e7eb',
                                            '&:hover': {
                                                borderColor: '#d1d5db',
                                            },
                                        }}
                                        fullWidth
                                    />
                                    {proof && (
                                        <Typography variant="caption" sx={{ color: '#6b7280', mt: 1 }}>
                                            Selected file: {proof.name}
                                        </Typography>
                                    )}
                                </Box>
                                <Button 
                                    type="submit" 
                                    variant="contained" 
                                    fullWidth
                                    sx={{
                                        bgcolor: '#3b82f6', // Stripe-like blue
                                        color: 'white',
                                        py: 1.5,
                                        borderRadius: 1,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: '1rem',
                                        boxShadow: '0 2px 10px rgba(59, 130, 246, 0.2)',
                                        '&:hover': {
                                            bgcolor: '#2563eb',
                                            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                                        },
                                        transition: 'all 0.3s ease-in-out',
                                    }}
                                >
                                    Submit Refund Request
                                </Button>
                            </form>
                        </Box>
                    </div>

                    {/* Success Snackbar */}
                    <Snackbar
                        open={successOpen}
                        autoHideDuration={3000}
                        onClose={handleSuccessClose}
                        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        <Alert
                            onClose={handleSuccessClose}
                            severity={successMessage.includes("Failed") ? "error" : "success"}
                            sx={{ width: '100%' }}
                        >
                            {successMessage}
                        </Alert>
                    </Snackbar>
                </main>
            </div>
        </div>
    );
};

export default RefundRequest;