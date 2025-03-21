//frontend/src/feature/auth/TeacherRegister.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Typography } from "@mui/material";

const TeacherRegister = () => {
    const [name, setName] = useState("");
    const [age, setAge] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post("http://localhost:5000/api/auth/register", {
                name,
                age,
                email,
                password,
                role: "teacher",
            });
            localStorage.setItem("userInfo", JSON.stringify(data));
            alert("Registration successful! Please log in.");
            navigate("/login");
        } catch (error) {
            console.error("Registration error:", error);
            alert(`Registration Failed: ${error.response?.data?.message || "Please try again"}`);
        }
    };

    return (
        <Box sx={{ maxWidth: 400, mx: "auto", p: 3 }}>
            <Typography variant="h4" gutterBottom>Teacher Registration</Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    label="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    label="age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    margin="normal"
                    required
                />
                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                    Register
                </Button>
            </form>
            <Typography sx={{ mt: 2 }}>
                Already have an account? <a href="/login">Login</a>
            </Typography>
        </Box>
    );
};

export default TeacherRegister;