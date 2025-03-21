// frontend/src/features/auth/RoleSelection.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Radio, RadioGroup, FormControlLabel, Button } from "@mui/material";

const RoleSelection = () => {
    const [role, setRole] = useState("");
    const navigate = useNavigate();

    const handleNext = () => {
        if (role === "teacher") {
            navigate("/register/teacher");
        } else if (role === "institute") {
            navigate("/register/institute");
        }
    };

    return (
        <Box sx={{ maxWidth: 400, mx: "auto", p: 3 }}>
            <Typography variant="h4" gutterBottom>Select Role</Typography>
            <RadioGroup value={role} onChange={(e) => setRole(e.target.value)}>
                <FormControlLabel value="teacher" control={<Radio />} label="Teacher" />
                <FormControlLabel value="institute" control={<Radio />} label="Institute" />
            </RadioGroup>
            <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleNext}
                disabled={!role}
                sx={{ mt: 2 }}
            >
                Next
            </Button>
            <Typography sx={{ mt: 2 }}>
                Are you a student? <a href="/register/student">Register as Student</a>
            </Typography>
        </Box>
    );
};

export default RoleSelection;