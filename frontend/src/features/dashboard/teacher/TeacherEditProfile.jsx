import { useState, useEffect } from "react";
import axios from "axios";
import {
    Box,
    Typography,
    TextField,
    Button,
    Alert,
    Avatar,
    Input,
    Grid,
    Paper,
    createTheme,
    ThemeProvider,
    Divider
} from "@mui/material";
import useAuth from "../../../hooks/useAuth";
import TeacherHeader from "../../../components/TeacherHeader/index";
import TeacherSidebar from "../../../components/TeacherSidebar/index";
import { motion } from "framer-motion";

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
        MuiTextField: {
            styleOverrides: {
                root: {
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
                },
            },
        },
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
        MuiAvatar: {
            styleOverrides: {
                root: {
                    border: '2px solid #e5e7eb',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                },
            },
        },
    },
});

const EditProfile = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        passwordConfirm: "",
        firstName: "",
        lastName: "",
        contactNumber: "",
        dateOfBirth: "",
        guardianName: "",
        guardianContactNumber: "",
        addressLine1: "",
        addressLine2: "",
        district: "",
        zipCode: "",
        username: "",
        age: ""
    });
    const [profilePicture, setProfilePicture] = useState(null);
    const [preview, setPreview] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                contactNumber: user.contactNumber || "",
                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
                guardianName: user.guardianName || "",
                guardianContactNumber: user.guardianContactNumber || "",
                addressLine1: user.addressLine1 || "",
                addressLine2: user.addressLine2 || "",
                district: user.district || "",
                zipCode: user.zipCode || "",
                username: user.username || "",
                age: user.age || ""
            });
            setPreview(user.profilePicture ? `http://localhost:5000${user.profilePicture}` : null);
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setProfilePicture(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key]) {
                data.append(key, formData[key]);
            }
        });
        if (profilePicture) {
            data.append('profilePicture', profilePicture);
        }

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    "Content-Type": "multipart/form-data"
                }
            };
            const { data: response } = await axios.put(
                "http://localhost:5000/api/auth/profile",
                data,
                config
            );

            // Update localStorage with new user data
            localStorage.setItem("userInfo", JSON.stringify({
                ...user,
                ...response.user
            }));

            setSuccess("Profile updated successfully!");
            setProfilePicture(null);
            setFormData(prev => ({
                ...prev,
            }));
        } catch (err) {
            setError(err.response?.data?.message || "Error updating profile");
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

    if (!user) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem' }}>
                    Loading...
                </Typography>
            </Box>
        );
    }

    return (
        
            <div className="bg-gray-50 min-h-screen flex flex-col">
                <TeacherHeader
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
                        <TeacherSidebar
                            isCollapsed={isSidebarCollapsed}
                            toggleSidebar={toggleSidebar}
                        />
                    </div>

                    <main
                        className={`flex-1 transition-all duration-300 ${
                            isSidebarCollapsed ? "ml-[60px]" : "ml-[20%] md:ml-[280px]"
                        } flex flex-col`}
                    >
                        <div className="mt-[64px] p-4 md:p-6 overflow-y-auto h-[calc(100vh-64px)]">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                sx={{ maxWidth: 900, mx: "auto" }}
                            >
                                <Paper elevation={3} sx={{ p: { xs: 3, md: 4 }, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                                    <Typography variant="h4" gutterBottom sx={{ mb: 4, fontSize: { xs: '1.5rem', md: '2rem' }, textAlign: 'center' }}>
                                        Edit Your Profile
                                    </Typography>
                                    {error && (
                                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2, fontSize: '1rem' }}>
                                            {error}
                                        </Alert>
                                    )}
                                    {success && (
                                        <Alert severity="success" sx={{ mb: 3, borderRadius: 2, fontSize: '1rem' }}>
                                            {success}
                                        </Alert>
                                    )}
                                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                                        <motion.div whileHover={{ scale: 1.00 }} whileTap={{ scale: 0.95 }}>
                                            <Avatar
                                                src={preview || (user.profilePicture ? `http://localhost:5000${user.profilePicture}` : undefined)}
                                                sx={{ width: 120, height: 120 }}
                                            />
                                        </motion.div>
                                    </Box>
                                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                                        <Input
                                            type="file"
                                            accept="image/jpeg,image/png"
                                            onChange={handleFileChange}
                                            sx={{ display: 'none' }}
                                            id="profile-picture-upload"
                                        />
                                        <label htmlFor="profile-picture-upload">
                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                <Button
                                                    variant="outlined"
                                                    component="span"
                                                    sx={{
                                                        borderColor: '#3b82f6',
                                                        color: '#3b82f6',
                                                        fontSize: '1rem',
                                                        px: 3,
                                                        py: 1,
                                                        '&:hover': {
                                                            bgcolor: '#e0f2fe',
                                                            borderColor: '#3b82f6',
                                                        },
                                                    }}
                                                >
                                                    Change Profile Picture
                                                </Button>
                                            </motion.div>
                                        </label>
                                    </Box>
                                    <form onSubmit={handleSubmit}>
                                        <Grid container spacing={3}>
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    label="Name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required
                                                    sx={{
                                                        bgcolor: '#f9fafb',
                                                        borderRadius: 1,
                                                        '& .MuiOutlinedInput-root': {
                                                            py: 1,
                                                            fontSize: '1rem',
                                                        },
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    label="Email"
                                                    name="email"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                    sx={{
                                                        bgcolor: '#f9fafb',
                                                        borderRadius: 1,
                                                        '& .MuiOutlinedInput-root': {
                                                            py: 1,
                                                            fontSize: '1rem',
                                                        },
                                                    }}
                                                />
                                            </Grid>
                                            {user.role === "student" && (
                                                <>
                                                    <Grid item xs={12} sm={6}>
                                                        <TextField
                                                            fullWidth
                                                            label="First Name"
                                                            name="firstName"
                                                            value={formData.firstName}
                                                            onChange={handleChange}
                                                            sx={{
                                                                bgcolor: '#f9fafb',
                                                                borderRadius: 1,
                                                                '& .MuiOutlinedInput-root': {
                                                                    py: 1,
                                                                    fontSize: '1rem',
                                                                },
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <TextField
                                                            fullWidth
                                                            label="Last Name"
                                                            name="lastName"
                                                            value={formData.lastName}
                                                            onChange={handleChange}
                                                            sx={{
                                                                bgcolor: '#f9fafb',
                                                                borderRadius: 1,
                                                                '& .MuiOutlinedInput-root': {
                                                                    py: 1,
                                                                    fontSize: '1rem',
                                                                },
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <TextField
                                                            fullWidth
                                                            label="Contact Number"
                                                            name="contactNumber"
                                                            value={formData.contactNumber}
                                                            onChange={handleChange}
                                                            sx={{
                                                                bgcolor: '#f9fafb',
                                                                borderRadius: 1,
                                                                '& .MuiOutlinedInput-root': {
                                                                    py: 1,
                                                                    fontSize: '1rem',
                                                                },
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <TextField
                                                            fullWidth
                                                            label="Date of Birth"
                                                            name="dateOfBirth"
                                                            type="date"
                                                            value={formData.dateOfBirth}
                                                            onChange={handleChange}
                                                            InputLabelProps={{ shrink: true }}
                                                            sx={{
                                                                bgcolor: '#f9fafb',
                                                                borderRadius: 1,
                                                                '& .MuiOutlinedInput-root': {
                                                                    py: 1,
                                                                    fontSize: '1rem',
                                                                },
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <TextField
                                                            fullWidth
                                                            label="Guardian Name"
                                                            name="guardianName"
                                                            value={formData.guardianName}
                                                            onChange={handleChange}
                                                            sx={{
                                                                bgcolor: '#f9fafb',
                                                                borderRadius: 1,
                                                                '& .MuiOutlinedInput-root': {
                                                                    py: 1,
                                                                    fontSize: '1rem',
                                                                },
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <TextField
                                                            fullWidth
                                                            label="Guardian Contact Number"
                                                            name="guardianContactNumber"
                                                            value={formData.guardianContactNumber}
                                                            onChange={handleChange}
                                                            sx={{
                                                                bgcolor: '#f9fafb',
                                                                borderRadius: 1,
                                                                '& .MuiOutlinedInput-root': {
                                                                    py: 1,
                                                                    fontSize: '1rem',
                                                                },
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <TextField
                                                            fullWidth
                                                            label="Address Line 1"
                                                            name="addressLine1"
                                                            value={formData.addressLine1}
                                                            onChange={handleChange}
                                                            sx={{
                                                                bgcolor: '#f9fafb',
                                                                borderRadius: 1,
                                                                '& .MuiOutlinedInput-root': {
                                                                    py: 1,
                                                                    fontSize: '1rem',
                                                                },
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <TextField
                                                            fullWidth
                                                            label="Address Line 2"
                                                            name="addressLine2"
                                                            value={formData.addressLine2}
                                                            onChange={handleChange}
                                                            sx={{
                                                                bgcolor: '#f9fafb',
                                                                borderRadius: 1,
                                                                '& .MuiOutlinedInput-root': {
                                                                    py: 1,
                                                                    fontSize: '1rem',
                                                                },
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <TextField
                                                            fullWidth
                                                            label="District"
                                                            name="district"
                                                            value={formData.district}
                                                            onChange={handleChange}
                                                            sx={{
                                                                bgcolor: '#f9fafb',
                                                                borderRadius: 1,
                                                                '& .MuiOutlinedInput-root': {
                                                                    py: 1,
                                                                    fontSize: '1rem',
                                                                },
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <TextField
                                                            fullWidth
                                                            label="Zip Code"
                                                            name="zipCode"
                                                            value={formData.zipCode}
                                                            onChange={handleChange}
                                                            sx={{
                                                                bgcolor: '#f9fafb',
                                                                borderRadius: 1,
                                                                '& .MuiOutlinedInput-root': {
                                                                    py: 1,
                                                                    fontSize: '1rem',
                                                                },
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <TextField
                                                            fullWidth
                                                            label="Username"
                                                            name="username"
                                                            value={formData.username}
                                                            onChange={handleChange}
                                                            sx={{
                                                                bgcolor: '#f9fafb',
                                                                borderRadius: 1,
                                                                '& .MuiOutlinedInput-root': {
                                                                    py: 1,
                                                                    fontSize: '1rem',
                                                                },
                                                            }}
                                                        />
                                                    </Grid>
                                                </>
                                            )}
                                            {user.role === "teacher" && (
                                                <>
                                                    <Grid item xs={12}>
                                                        <TextField
                                                            fullWidth
                                                            label="Age"
                                                            name="age"
                                                            type="number"
                                                            value={formData.age}
                                                            onChange={handleChange}
                                                            sx={{
                                                                bgcolor: '#f9fafb',
                                                                borderRadius: 1,
                                                                '& .MuiOutlinedInput-root': {
                                                                    py: 1,
                                                                    fontSize: '1rem',
                                                                },
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <TextField
                                                            fullWidth
                                                            label="Contact Number"
                                                            name="contactNumber"
                                                            value={formData.contactNumber}
                                                            onChange={handleChange}
                                                            sx={{
                                                                bgcolor: '#f9fafb',
                                                                borderRadius: 1,
                                                                '& .MuiOutlinedInput-root': {
                                                                    py: 1,
                                                                    fontSize: '1rem',
                                                                },
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <TextField
                                                            fullWidth
                                                            label="Address Line 1"
                                                            name="addressLine1"
                                                            value={formData.addressLine1}
                                                            onChange={handleChange}
                                                            sx={{
                                                                bgcolor: '#f9fafb',
                                                                borderRadius: 1,
                                                                '& .MuiOutlinedInput-root': {
                                                                    py: 1,
                                                                    fontSize: '1rem',
                                                                },
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12}>
                                                        <TextField
                                                            fullWidth
                                                            label="Address Line 2"
                                                            name="addressLine2"
                                                            value={formData.addressLine2}
                                                            onChange={handleChange}
                                                            sx={{
                                                                bgcolor: '#f9fafb',
                                                                borderRadius: 1,
                                                                '& .MuiOutlinedInput-root': {
                                                                    py: 1,
                                                                    fontSize: '1rem',
                                                                },
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <TextField
                                                            fullWidth
                                                            label="District"
                                                            name="district"
                                                            value={formData.district}
                                                            onChange={handleChange}
                                                            sx={{
                                                                bgcolor: '#f9fafb',
                                                                borderRadius: 1,
                                                                '& .MuiOutlinedInput-root': {
                                                                    py: 1,
                                                                    fontSize: '1rem',
                                                                },
                                                            }}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} sm={6}>
                                                        <TextField
                                                            fullWidth
                                                            label="Zip Code"
                                                            name="zipCode"
                                                            value={formData.zipCode}
                                                            onChange={handleChange}
                                                            sx={{
                                                                bgcolor: '#f9fafb',
                                                                borderRadius: 1,
                                                                '& .MuiOutlinedInput-root': {
                                                                    py: 1,
                                                                    fontSize: '1rem',
                                                                },
                                                            }}
                                                        />
                                                    </Grid>
                                                </>
                                            )}
                                            <Grid item xs={12}>
                                                <Divider sx={{ my: 3, borderColor: '#e5e7eb' }} />
                                                <motion.div whileHover={{ scale: 1.00 }} whileTap={{ scale: 0.95 }}>
                                                    <Button
                                                        type="submit"
                                                        variant="contained"
                                                        color="primary"
                                                        fullWidth
                                                        sx={{
                                                            bgcolor: '#3b82f6',
                                                            '&:hover': {
                                                                bgcolor: '#2563eb',
                                                            },
                                                            px: 4,
                                                            py: 1.5,
                                                        }}
                                                    >
                                                        Update Profile
                                                    </Button>
                                                </motion.div>
                                            </Grid>
                                        </Grid>
                                    </form>
                                </Paper>
                            </motion.div>
                        </div>
                    </main>
                </div>
            </div>
        
    );
};

export default EditProfile;