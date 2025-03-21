//frontend/src/feature/auth/InstituteRegister.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Typography } from "@mui/material";

const InstituteRegister = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post("http://localhost:5000/api/auth/register", {
                name,
                email,
                password,
                role: "institute",
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
            <Typography variant="h4" gutterBottom>Institute Registration</Typography>
            <form onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    label="Institute Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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

export default InstituteRegister; // Ensure this line is present