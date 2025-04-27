import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    Box,
    Typography,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Paper,
    Alert,
    CircularProgress
} from "@mui/material";
import useAuth from "../../../hooks/useAuth";

const TeacherSupportForm = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [categoryId, setCategoryId] = useState("");
    const [subcategoryId, setSubcategoryId] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get("http://localhost:5000/api/auth/support/categories", config);
                setCategories(data);
            } catch (err) {
                setError(err.response?.data?.message || "Error loading categories");
            }
        };
        fetchCategories();
    }, [user.token]);

    useEffect(() => {
        const fetchSubcategories = async () => {
            if (categoryId) {
                try {
                    const config = { headers: { Authorization: `Bearer ${user.token}` } };
                    const { data } = await axios.get(`http://localhost:5000/api/auth/support/subcategories/${categoryId}`, config);
                    setSubcategories(data);
                    setSubcategoryId(""); // Reset subcategory when category changes
                } catch (err) {
                    setError(err.response?.data?.message || "Error loading subcategories");
                }
            } else {
                setSubcategories([]);
                setSubcategoryId("");
            }
        };
        fetchSubcategories();
    }, [categoryId, user.token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post(
                "http://localhost:5000/api/auth/support/submit",
                { categoryId, subcategoryId, message },
                config
            );
            setSuccess(data.message);
            setCategoryId("");
            setSubcategoryId("");
            setMessage("");
            setTimeout(() => navigate(`/${user.role}/support-tickets`), 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Error submitting support ticket");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 800, mx: "auto", p: 3, mt: "50px" }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h4" gutterBottom>Submit a Request</Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                <form onSubmit={handleSubmit}>
                    <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            label="Category"
                            required
                        >
                            <MenuItem value=""><em>Select a category</em></MenuItem>
                            {categories.map((category) => (
                                <MenuItem key={category._id} value={category._id}>
                                    {category.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth variant="outlined" sx={{ mb: 2 }} disabled={!categoryId}>
                        <InputLabel>Subcategory</InputLabel>
                        <Select
                            value={subcategoryId}
                            onChange={(e) => setSubcategoryId(e.target.value)}
                            label="Subcategory"
                            required
                        >
                            <MenuItem value=""><em>Select a subcategory</em></MenuItem>
                            {subcategories.map((subcategory) => (
                                <MenuItem key={subcategory._id} value={subcategory._id}>
                                    {subcategory.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth
                        label="Your email"
                        value={user.email}
                        variant="outlined"
                        sx={{ mb: 2 }}
                        disabled
                    />

                    <TextField
                        fullWidth
                        label="Write us a message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        variant="outlined"
                        multiline
                        rows={4}
                        sx={{ mb: 2 }}
                        required
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={loading}
                        sx={{ py: 1.5, textTransform: 'none' }}
                    >
                        {loading ? <CircularProgress size={24} /> : "Send"}
                    </Button>
                </form>
            </Paper>
        </Box>
    );
};

export default TeacherSupportForm;