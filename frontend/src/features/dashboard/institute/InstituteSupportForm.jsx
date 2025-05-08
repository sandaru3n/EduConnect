//frontend/src/features/dashboard/teacher/TeacherSupportForm.jsx
import { useState, useEffect } from "react";
import { Breadcrumbs, Link as MuiLink, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import TawkMessengerReact from '@tawk.to/tawk-messenger-react';
import InstituteSidebar from "../../../components/InstituteSidebar/index";
import InstituteHeader from "../../../components/InstituteHeader/index";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    Box,
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

const InstiruteSupportForm = () => {
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
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

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

  useEffect(() => {
    const handleResize = () => {
      const mobileView = window.innerWidth <= 768;
      setIsMobile(mobileView);
      setIsSidebarCollapsed(mobileView); // Auto-collapse on mobile
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const pathnames = location.pathname.split("/").filter((x) => x);
  const breadcrumbItems = pathnames.map((value, index) => {
    const last = index === pathnames.length - 1;
    const to = `/${pathnames.slice(0, index + 1).join("/")}`;
    const displayName = value.charAt(0).toUpperCase() + value.slice(1);

    return last ? (
      <Typography key={to} color="text.primary">
        {displayName}
      </Typography>
    ) : (
      <MuiLink
        key={to}
        component={Link}
        to={to}
        underline="hover"
        color="inherit"
      >
        {displayName}
      </MuiLink>
    );
  });

  // Get the current page name for the tab title
  const pageTitle = pathnames.length > 0 
    ? pathnames[pathnames.length - 1].charAt(0).toUpperCase() + pathnames[pathnames.length - 1].slice(1)
    : "Dashboard"; // Default title if no pathnames

  // Update document title when location changes
  useEffect(() => {
    document.title = `TeacherDashboard - EduConnect`; // You can customize the format
  }, [location, pageTitle]);

  return (
    <div>
      <InstituteHeader 
        isSidebarCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        isMobile={isMobile}
      />
      
      <div className="flex min-h-screen">
        <div
          className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 ${
            isSidebarCollapsed ? "w-[60px]" : "w-[18%] md:w-[250px]"
          }`}
        >
          <InstituteSidebar 
            isCollapsed={isSidebarCollapsed} 
            toggleSidebar={toggleSidebar} 
          />
        </div>

        <div
          className={`flex-1 transition-all duration-300 ${
            isSidebarCollapsed ? "ml-[60px]" : "ml-[18%] md:ml-[250px]"
          }`}
        >
          <div
            className={`mt-[50px] py-2 px-4 md:px-6 bg-gray-100 border-b fixed top-0 w-full z-30 transition-all duration-300 ${
              isSidebarCollapsed 
                ? "ml-[60px] w-[calc(100%-60px)]" 
                : "ml-[18%] w-[calc(100%-18%)] md:ml-[250px] md:w-[calc(100%-250px)]"
            }`}
          >
            {/* Breadcrumbs */}
        <div
          className={`mt-[50px] py-2 px-4 md:px-6 bg-gray-100 border-b transition-all duration-300 z-30 fixed top-0 left-0 w-full ${
            isSidebarCollapsed
              ? "ml-[60px] w-[calc(100%-60px)]"
              : "ml-[18%] w-[calc(100%-18%)] md:ml-[250px] md:w-[calc(100%-250px)]"
          }`}
        >
          <Breadcrumbs aria-label="breadcrumb">
            <MuiLink component={Link} to="/student" underline="hover" color="inherit">
              Student
            </MuiLink>
            {breadcrumbItems}
          </Breadcrumbs>
          </div></div>
        
          
          <div className="mt-[90px] p-4 md:p-6 overflow-y-auto h-[calc(100vh-90px)]">
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

        <div className="App">
                    <TawkMessengerReact
                        propertyId="681cb6ba504921190cbdc663"
                        widgetId="1iqo2jif0"/>
                </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstiruteSupportForm;