// frontend/src/features/auth/TeacherRegister.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Typography, Select, MenuItem, InputLabel, FormControl } from "@mui/material";

const TeacherRegister = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "",
        age: "",
        email: "",
        password: "",
        subscriptionId: "",
        cardNumber: "",
        expiryDate: "",
        cvv: "",
    });
    const [subscriptions, setSubscriptions] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSubscriptions = async () => {
            try {
                const { data } = await axios.get("http://localhost:5000/api/subscriptions");
                // Filter only active subscriptions
                const activeSubscriptions = data.filter(sub => sub.status === "Active");
                setSubscriptions(activeSubscriptions);
            } catch (error) {
                console.error("Error fetching subscriptions:", error);
            }
        };
        fetchSubscriptions();
    }, []);

    // Corrected handleChange function
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNext = () => {
        if (step === 1 && formData.name && formData.age) {
            setStep(2);
        } else if (step === 2 && formData.email && formData.password) {
            setStep(3);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Register user
            const { data } = await axios.post("http://localhost:5000/api/auth/register", {
                name: formData.name,
                age: formData.age,
                email: formData.email,
                password: formData.password,
                role: "teacher",
                subscriptionId: formData.subscriptionId,
            });

            // Process payment
            await axios.post(
                "http://localhost:5000/api/payments/subscribe-plan",
                {
                    userId: data._id,
                    subscriptionId: formData.subscriptionId,
                    cardNumber: formData.cardNumber,
                    expiryDate: formData.expiryDate,
                    cvv: formData.cvv,
                },
                { headers: { Authorization: `Bearer ${data.token}` } }
            );

            localStorage.setItem("userInfo", JSON.stringify(data));
            alert("Registration and payment successful! Please log in.");
            navigate("/login");
        } catch (error) {
            console.error("Registration error:", error);
            alert(`Registration Failed: ${error.response?.data?.message || "Please try again"}`);
        }
    };

    return (
        <Box sx={{ maxWidth: 400, mx: "auto", p: 3 }}>
            <Typography variant="h4" gutterBottom>Teacher Registration - Step {step}/3</Typography>
            <form onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()}>
                {step === 1 && (
                    <>
                        <TextField
                            fullWidth
                            label="Full Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Age"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            margin="normal"
                            required
                        />
                        <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={handleNext}>
                            Next
                        </Button>
                    </>
                )}
                {step === 2 && (
                    <>
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            margin="normal"
                            required
                        />
                        <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }} onClick={handleNext}>
                            Next
                        </Button>
                        <Button variant="outlined" fullWidth sx={{ mt: 2 }} onClick={() => setStep(1)}>
                            Back
                        </Button>
                    </>
                )}
                {step === 3 && (
                    <>
                        <FormControl fullWidth sx={{ mb: 3 }}>
                            <InputLabel>Select Subscription Plan</InputLabel>
                            <Select
                                name="subscriptionId"
                                value={formData.subscriptionId}
                                onChange={handleChange}
                                required
                            >
                                <MenuItem value="">-- Select a Plan --</MenuItem>
                                {subscriptions.map((sub) => (
                                    <MenuItem key={sub._id} value={sub._id}>
                                        {sub.plan} - ${sub.price}/month
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            fullWidth
                            label="Card Number"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleChange}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Expiry Date (MM/YY)"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleChange}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="CVV"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleChange}
                            margin="normal"
                            required
                        />
                        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                            Register & Pay
                        </Button>
                        <Button variant="outlined" fullWidth sx={{ mt: 2 }} onClick={() => setStep(2)}>
                            Back
                        </Button>
                    </>
                )}
            </form>
            <Typography sx={{ mt: 2 }}>
                Already have an account? <a href="/login">Login</a>
            </Typography>
        </Box>
    );
};

export default TeacherRegister;