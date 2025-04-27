import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
    Divider,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from "@mui/material";
import useAuth from "../../../hooks/useAuth";

const AdminSupportCategories = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [newCategory, setNewCategory] = useState("");
    const [newSubcategory, setNewSubcategory] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data: catData } = await axios.get("http://localhost:5000/api/auth/support/categories", config);
                setCategories(catData);
                const { data: subData } = await axios.get("http://localhost:5000/api/auth/support/subcategories/all", config);
                setSubcategories(subData);
            } catch (err) {
                console.error("Error fetching support subcategories:", err.response || err);
                setError(err.response?.data?.message || "Error retrieving support subcategories");
            }
        };
        fetchData();
    }, [user.token]);

    const handleAddCategory = async () => {
        setError(null);
        setSuccess(null);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post(
                "http://localhost:5000/api/auth/admin/support/category",
                { name: newCategory },
                config
            );
            setCategories([...categories, data.category]);
            setSuccess(data.message);
            setNewCategory("");
        } catch (err) {
            setError(err.response?.data?.message || "Error adding category");
        }
    };

    const handleAddSubcategory = async () => {
        setError(null);
        setSuccess(null);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post(
                "http://localhost:5000/api/auth/admin/support/subcategory",
                { name: newSubcategory, categoryId: selectedCategoryId },
                config
            );
            setSubcategories([...subcategories, data.subcategory]);
            setSuccess(data.message);
            setNewSubcategory("");
            setSelectedCategoryId("");
        } catch (err) {
            setError(err.response?.data?.message || "Error adding subcategory");
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        setError(null);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.delete(
                `http://localhost:5000/api/auth/admin/support/category/${categoryId}`,
                config
            );
            setCategories(categories.filter(cat => cat._id !== categoryId));
            setSubcategories(subcategories.filter(sub => sub.categoryId.toString() !== categoryId));
            setSuccess(data.message);
        } catch (err) {
            setError(err.response?.data?.message || "Error deleting category");
        }
    };

    const handleDeleteSubcategory = async (subcategoryId) => {
        setError(null);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.delete(
                `http://localhost:5000/api/auth/admin/support/subcategory/${subcategoryId}`,
                config
            );
            setSubcategories(subcategories.filter(sub => sub._id !== subcategoryId));
            setSuccess(data.message);
        } catch (err) {
            setError(err.response?.data?.message || "Error deleting subcategory");
        }
    };

    return (
        <Box sx={{ maxWidth: 800, mx: "auto", p: 3, mt: "50px" }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h4" gutterBottom>Manage Support Categories</Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                {/* Add Category */}
                <Typography variant="h5" gutterBottom>Add Category</Typography>
                <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
                    <TextField
                        fullWidth
                        label="Category Name"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        variant="outlined"
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAddCategory}
                        disabled={!newCategory}
                    >
                        Add
                    </Button>
                </Box>

                {/* Add Subcategory */}
                <Typography variant="h5" gutterBottom>Add Subcategory</Typography>
                <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
                    <FormControl fullWidth variant="outlined">
                        <InputLabel>Category</InputLabel>
                        <Select
                            value={selectedCategoryId}
                            onChange={(e) => setSelectedCategoryId(e.target.value)}
                            label="Category"
                        >
                            <MenuItem value=""><em>Select a category</em></MenuItem>
                            {categories.map((category) => (
                                <MenuItem key={category._id} value={category._id}>
                                    {category.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth
                        label="Subcategory Name"
                        value={newSubcategory}
                        onChange={(e) => setNewSubcategory(e.target.value)}
                        variant="outlined"
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAddSubcategory}
                        disabled={!selectedCategoryId || !newSubcategory}
                    >
                        Add
                    </Button>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Categories Table */}
                <Typography variant="h5" gutterBottom>Categories</Typography>
                {categories.length > 0 ? (
                    <TableContainer sx={{ mb: 4 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {categories.map((category) => (
                                    <TableRow key={category._id}>
                                        <TableCell>{category.name}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                onClick={() => handleDeleteCategory(category._id)}
                                            >
                                                Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                        No categories available.
                    </Typography>
                )}

                {/* Subcategories Table */}
                <Typography variant="h5" gutterBottom>Subcategories</Typography>
                {subcategories.length > 0 ? (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {subcategories.map((subcategory) => {
                                    const category = categories.find(cat => cat._id === subcategory.categoryId.toString());
                                    return (
                                        <TableRow key={subcategory._id}>
                                            <TableCell>{subcategory.name}</TableCell>
                                            <TableCell>{category?.name || "N/A"}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    onClick={() => handleDeleteSubcategory(subcategory._id)}
                                                >
                                                    Delete
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Typography variant="body1" color="text.secondary">
                        No subcategories available.
                    </Typography>
                )}
            </Paper>
        </Box>
    );
};

export default AdminSupportCategories;