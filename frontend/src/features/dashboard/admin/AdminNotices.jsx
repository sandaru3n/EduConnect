// frontend/src/features/dashboard/admin/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { Breadcrumbs, Link as MuiLink, Typography, Box, Paper, Button, Divider, CircularProgress } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import AdminSidebar from "../../../components/AdminSidebar/index";
import AdminHeader from "../../../components/AdminHeader/index";

import axios from "axios";
import {  
    TextField,
    Card,
    CardContent,
    CardActions,  
    Alert,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from "@mui/material";
import useAuth from "../../../hooks/useAuth";



const AdminNotices = () => {
    const { user } = useAuth();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [recipients, setRecipients] = useState("");
    const [notices, setNotices] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editNoticeId, setEditNoticeId] = useState(null);
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);


  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
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

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchNotices = async () => {
        setLoading(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            const { data } = await axios.get("http://localhost:5000/api/auth/admin/notices", config);
            setNotices(data);
        } catch (err) {
            setError(err.response?.data?.message || "Error loading notices");
        } finally {
            setLoading(false);
        }
    };
    fetchNotices();
}, [user.token]);

const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
        const config = {
            headers: { Authorization: `Bearer ${user.token}` }
        };
        if (editNoticeId) {
            // Update existing notice
            const { data } = await axios.put(
                "http://localhost:5000/api/auth/admin/notices",
                { noticeId: editNoticeId, title, description, date, recipients },
                config
            );
            setNotices(notices.map(n => n._id === editNoticeId ? data.notice : n));
            setEditNoticeId(null);
        } else {
            // Create new notice
            const { data } = await axios.post(
                "http://localhost:5000/api/auth/admin/notices",
                { title, description, date, recipients },
                config
            );
            setNotices([data.notice, ...notices]);
        }
        setTitle("");
        setDescription("");
        setDate("");
        setRecipients("");
    } catch (err) {
        setError(err.response?.data?.message || "Error saving notice");
    } finally {
        setLoading(false);
    }
};

const handleEdit = (notice) => {
    setEditNoticeId(notice._id);
    setTitle(notice.title);
    setDescription(notice.description);
    setDate(notice.date.split("T")[0]);
    setRecipients(notice.recipients);
};

const handleDelete = async (noticeId) => {
    setError(null);
    try {
        const config = {
            headers: { Authorization: `Bearer ${user.token}` }
        };
        await axios.delete(`http://localhost:5000/api/auth/admin/notices/${noticeId}`, config);
        setNotices(notices.filter(n => n._id !== noticeId));
    } catch (err) {
        setError(err.response?.data?.message || "Error deleting notice");
    }
};

  const pathnames = location.pathname.split("/").filter((x) => x);
  const breadcrumbItems = pathnames.map((value, index) => {
    const last = index === pathnames.length - 1;
    const to = `/${pathnames.slice(0, index + 1).join("/")}`;
    const displayName = value.charAt(0).toUpperCase() + value.slice(1);

    return last ? (
      <Typography key={to} color="text.primary" fontWeight="medium">
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
    document.title = `${pageTitle} - Admin Panel`;
  }, [location, pageTitle]);

  

 


  return (
    <div className="bg-gray-50 min-h-screen">
      <AdminHeader
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
          <AdminSidebar
            isCollapsed={isSidebarCollapsed}
            toggleSidebar={toggleSidebar}
          />
        </div>

        <div
          className={`flex-1 transition-all duration-300 ${
            isSidebarCollapsed ? "ml-[60px]" : "ml-[18%] md:ml-[250px]"
          }`}
        >
          {/* Breadcrumbs */}
          <div
            className={`mt-[50px] py-3 px-6 bg-white border-b shadow-sm transition-all duration-300 z-30 fixed top-0 left-0 w-full ${
              isSidebarCollapsed
                ? "ml-[60px] w-[calc(100%-60px)]"
                : "ml-[18%] w-[calc(100%-18%)] md:ml-[250px] md:w-[calc(100%-250px)]"
            }`}
          >
            <Breadcrumbs aria-label="breadcrumb">
              <MuiLink component={Link} to="/admin" underline="hover" color="inherit">
                Admin
              </MuiLink>
              {breadcrumbItems}
            </Breadcrumbs>
          </div>

          <div className="mt-[100px] p-6 md:p-8 overflow-y-auto h-[calc(100vh-100px)]">
          <Box sx={{ maxWidth: 800, mx: "auto", p: 3, mt: "50px" }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h4" gutterBottom>Notices & Announcements</Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <TextField
                        fullWidth
                        label="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        variant="outlined"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        variant="outlined"
                        multiline
                        rows={4}
                        required
                    />
                    <TextField
                        fullWidth
                        label="Date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                        required
                    />
                    <FormControl fullWidth variant="outlined">
                        <InputLabel>Recipients</InputLabel>
                        <Select
                            value={recipients}
                            onChange={(e) => setRecipients(e.target.value)}
                            label="Recipients"
                            required
                        >
                            <MenuItem value="teachers">Teachers</MenuItem>
                            <MenuItem value="institutes">Institutes</MenuItem>
                            <MenuItem value="teachers_and_institutes">Teachers & Institutes</MenuItem>
                        </Select>
                    </FormControl>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={loading}
                        sx={{ py: 1.5, textTransform: 'none' }}
                    >
                        {loading ? <CircularProgress size={24} /> : editNoticeId ? "Update Notice" : "Publish Notice"}
                    </Button>
                    {editNoticeId && (
                        <Button
                            variant="outlined"
                            color="secondary"
                            fullWidth
                            onClick={() => {
                                setEditNoticeId(null);
                                setTitle("");
                                setDescription("");
                                setDate("");
                                setRecipients("");
                            }}
                            sx={{ py: 1.5, textTransform: 'none' }}
                        >
                            Cancel Edit
                        </Button>
                    )}
                </form>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h5" gutterBottom>Published Notices</Typography>
                {loading ? (
                    <Typography variant="body1" color="text.secondary">
                        Loading notices...
                    </Typography>
                ) : notices.length > 0 ? (
                    notices.map((notice) => (
                        <Card key={notice._id} sx={{ mt: 2, borderRadius: 2, boxShadow: 3 }}>
                            <CardContent>
                                <Typography variant="h6">
                                    {notice.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Recipients: {notice.recipients.replace("_and_", " & ")}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Date: {new Date(notice.date).toLocaleDateString()}
                                </Typography>
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    {notice.description}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Published: {new Date(notice.createdAt).toLocaleString()}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => handleEdit(notice)}
                                    sx={{ textTransform: 'none' }}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() => handleDelete(notice._id)}
                                    sx={{ textTransform: 'none' }}
                                >
                                    Delete
                                </Button>
                            </CardActions>
                        </Card>
                    ))
                ) : (
                    <Typography variant="body1" color="text.secondary">
                        No notices published yet.
                    </Typography>
                )}
            </Paper>
        </Box>
                        
                      
                  
            
      
    </div></div></div></div>
  );
};

export default AdminNotices;