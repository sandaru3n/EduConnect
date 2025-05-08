import { useState, useEffect } from "react";
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
    MenuItem,
    createTheme,
    ThemeProvider
} from "@mui/material";
import useAuth from "../../../hooks/useAuth";
import AdminHeader from "../../../components/AdminHeader/index";
import AdminSidebar from "../../../components/AdminSidebar/index";
import { Breadcrumbs, Link as MuiLink } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

// Create a custom MUI theme to apply the Roboto font globally
const theme = createTheme({
    typography: {
        fontFamily: 'Roboto, sans-serif',
        h4: {
            fontWeight: 600,
            color: '#1a202c',
        },
        h5: {
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
                    '&:hover': {
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    },
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    fontWeight: 600,
                    color: '#1a202c',
                    backgroundColor: '#f9fafb',
                },
                body: {
                    color: '#6b7280',
                    fontSize: '1rem',
                },
            },
        },
    },
});

const AdminSupportCategories = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
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
                `http://localhost:5000/api/auth/admin/support/subcategory/${categoryId}`,
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
                    fontSize: { xs: '0.9rem', md: '1rem' },
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
                    fontSize: { xs: '0.9rem', md: '1rem' },
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
        
            <div className="bg-gray-50 min-h-screen flex flex-col">
                <AdminHeader
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
                        <AdminSidebar
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

                        <div className="mt-[120px] p-4 md:p-6 overflow-y-auto h-[calc(100vh-120px)]">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                sx={{ maxWidth: 900, mx: "auto" }}
                            >
                                <Paper elevation={3} sx={{ p: 4, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                                    <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
                                        Manage Support Categories
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

                                    {/* Add Category */}
                                    <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                                        Add Category
                                    </Typography>
                                    <Box sx={{ display: "flex", gap: 2, mb: 4, alignItems: 'center' }}>
                                        <TextField
                                            fullWidth
                                            label="Category Name"
                                            value={newCategory}
                                            onChange={(e) => setNewCategory(e.target.value)}
                                            variant="outlined"
                                            sx={{
                                                bgcolor: '#f9fafb',
                                                borderRadius: 1,
                                                '& .MuiOutlinedInput-root': {
                                                    py: 1,
                                                    fontSize: '1rem',
                                                },
                                            }}
                                        />
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={handleAddCategory}
                                                disabled={!newCategory}
                                                sx={{
                                                    bgcolor: '#3b82f6',
                                                    '&:hover': {
                                                        bgcolor: '#2563eb',
                                                    },
                                                    fontSize: '1rem',
                                                    px: 4,
                                                    py: 1.5,
                                                }}
                                            >
                                                Add
                                            </Button>
                                        </motion.div>
                                    </Box>

                                    {/* Add Subcategory */}
                                    <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                                        Add Subcategory
                                    </Typography>
                                    <Box sx={{ display: "flex", gap: 2, mb: 4, alignItems: 'center' }}>
                                        <FormControl fullWidth variant="outlined">
                                            <InputLabel>Category</InputLabel>
                                            <Select
                                                value={selectedCategoryId}
                                                onChange={(e) => setSelectedCategoryId(e.target.value)}
                                                label="Category"
                                                sx={{
                                                    bgcolor: '#f9fafb',
                                                    borderRadius: 1,
                                                    '& .MuiOutlinedInput-root': {
                                                        py: 1,
                                                        fontSize: '1rem',
                                                    },
                                                }}
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
                                            sx={{
                                                bgcolor: '#f9fafb',
                                                borderRadius: 1,
                                                '& .MuiOutlinedInput-root': {
                                                    py: 1,
                                                    fontSize: '1rem',
                                                },
                                            }}
                                        />
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={handleAddSubcategory}
                                                disabled={!selectedCategoryId || !newSubcategory}
                                                sx={{
                                                    bgcolor: '#3b82f6',
                                                    '&:hover': {
                                                        bgcolor: '#2563eb',
                                                    },
                                                    fontSize: '1rem',
                                                    px: 4,
                                                    py: 1.5,
                                                }}
                                            >
                                                Add
                                            </Button>
                                        </motion.div>
                                    </Box>

                                    <Divider sx={{ my: 4, borderColor: '#e5e7eb' }} />

                                    {/* Categories Table */}
                                    <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                                        Categories
                                    </Typography>
                                    {categories.length > 0 ? (
                                        <TableContainer sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Name</TableCell>
                                                        <TableCell>Actions</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {categories.map((category) => (
                                                        <TableRow
                                                            key={category._id}
                                                            sx={{
                                                                '&:hover': {
                                                                    bgcolor: '#f9fafb',
                                                                },
                                                            }}
                                                        >
                                                            <TableCell>{category.name}</TableCell>
                                                            <TableCell>
                                                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                                    <Button
                                                                        variant="outlined"
                                                                        color="error"
                                                                        onClick={() => handleDeleteCategory(category._id)}
                                                                        sx={{
                                                                            borderRadius: 1,
                                                                            fontSize: '0.9rem',
                                                                            px: 3,
                                                                            py: 0.5,
                                                                            '&:hover': {
                                                                                bgcolor: '#fee2e2',
                                                                                borderColor: '#ef4444',
                                                                            },
                                                                        }}
                                                                    >
                                                                        Delete
                                                                    </Button>
                                                                </motion.div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    ) : (
                                        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: '1rem' }}>
                                            No categories available.
                                        </Typography>
                                    )}

                                    {/* Subcategories Table */}
                                    <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
                                        Subcategories
                                    </Typography>
                                    {subcategories.length > 0 ? (
                                        <TableContainer sx={{ borderRadius: 2, overflow: 'hidden' }}>
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
                                                            <TableRow
                                                                key={subcategory._id}
                                                                sx={{
                                                                    '&:hover': {
                                                                        bgcolor: '#f9fafb',
                                                                    },
                                                                }}
                                                            >
                                                                <TableCell>{subcategory.name}</TableCell>
                                                                <TableCell>{category?.name || "N/A"}</TableCell>
                                                                <TableCell>
                                                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                                        <Button
                                                                            variant="outlined"
                                                                            color="error"
                                                                            onClick={() => handleDeleteSubcategory(subcategory._id)}
                                                                            sx={{
                                                                                borderRadius: 1,
                                                                                fontSize: '0.9rem',
                                                                                px: 3,
                                                                                py: 0.5,
                                                                                '&:hover': {
                                                                                    bgcolor: '#fee2e2',
                                                                                    borderColor: '#ef4444',
                                                                                },
                                                                            }}
                                                                        >
                                                                            Delete
                                                                        </Button>
                                                                    </motion.div>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    ) : (
                                        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem' }}>
                                            No subcategories available.
                                        </Typography>
                                    )}
                                </Paper>
                            </motion.div>
                        </div>
                    </main>
                </div>
            </div>
        
    );
};

export default AdminSupportCategories;