//frontend/src/features/dashboard/admin/AdminEditProfile.jsx
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
    Paper
} from "@mui/material";
import useAuth from "../../../hooks/useAuth";

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

    if (!user) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h4" gutterBottom>Edit Profile</Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                    <Avatar
                        src={preview || (user.profilePicture ? `http://localhost:5000${user.profilePicture}` : undefined)}
                        sx={{ width: 120, height: 120 }}
                    />
                </Box>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Input
                        type="file"
                        accept="image/jpeg,image/png"
                        onChange={handleFileChange}
                        sx={{ display: 'none' }}
                        id="profile-picture-upload"
                    />
                    <label htmlFor="profile-picture-upload">
                        <Button variant="outlined" component="span">
                            Change Profile Picture
                        </Button>
                    </label>
                </Box>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
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
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Last Name"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Contact Number"
                                        name="contactNumber"
                                        value={formData.contactNumber}
                                        onChange={handleChange}
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
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Guardian Name"
                                        name="guardianName"
                                        value={formData.guardianName}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Guardian Contact Number"
                                        name="guardianContactNumber"
                                        value={formData.guardianContactNumber}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Address Line 1"
                                        name="addressLine1"
                                        value={formData.addressLine1}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Address Line 2"
                                        name="addressLine2"
                                        value={formData.addressLine2}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="District"
                                        name="district"
                                        value={formData.district}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Zip Code"
                                        name="zipCode"
                                        value={formData.zipCode}
                                        onChange={handleChange}
                                    />
                                </Grid>
                                
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                    />
                                </Grid>
                            </>
                        )}
                        {user.role === "teacher" && (
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Age"
                                    name="age"
                                    type="number"
                                    value={formData.age}
                                    onChange={handleChange}
                                />
                            </Grid>
                        )}
                    </Grid>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mt: 3 }}
                    >
                        Update Profile
                    </Button>
                </form>
            </Paper>
        </Box>
    );
};

export default EditProfile;