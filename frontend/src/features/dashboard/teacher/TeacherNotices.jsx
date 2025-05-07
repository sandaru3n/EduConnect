//frontend/src/features/dashboard/teacher/TeacherNotices.jsx
import { useState, useEffect } from "react";
import { Breadcrumbs, Link as MuiLink, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import StudentSidebar from "../../../components/TeacherSidebar/index";
import StudentHeader from "../../../components/TeacherHeader/index";

import axios from "axios";
import {
    Box,
    TextField,
    Button,
    Paper,
    Card,
    CardContent,
    CardActions,
    CircularProgress,
    Alert,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Divider
} from "@mui/material";
import useAuth from "../../../hooks/useAuth";

const TeacherNotices = () => {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAuth();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [classId, setClassId] = useState("");
    const [classes, setClasses] = useState([]);
    const [notices, setNotices] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editNoticeId, setEditNoticeId] = useState(null);

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


  useEffect(() => {
    const fetchClasses = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            const { data } = await axios.get("http://localhost:5000/api/quiz/teacher/classes", config);
            setClasses(data);
        } catch (err) {
            setError(err.response?.data?.message || "Error loading classes");
        }
    };

    const fetchNotices = async () => {
        setLoading(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` }
            };
            const { data } = await axios.get("http://localhost:5000/api/auth/notices/teacher", config);
            setNotices(data);
        } catch (err) {
            setError(err.response?.data?.message || "Error loading notices");
        } finally {
            setLoading(false);
        }
    };

    fetchClasses();
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
                "http://localhost:5000/api/auth/notices",
                { noticeId: editNoticeId, title, description, date, classId },
                config
            );
            setNotices(notices.map(n => n._id === editNoticeId ? data.notice : n));
            setEditNoticeId(null);
        } else {
            // Create new notice
            const { data } = await axios.post(
                "http://localhost:5000/api/auth/notices",
                { title, description, date, classId },
                config
            );
            setNotices([data.notice, ...notices]);
        }
        setTitle("");
        setDescription("");
        setDate("");
        setClassId("");
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
    setClassId(notice.classId._id);
};

const handleDelete = async (noticeId) => {
    setError(null);
    try {
        const config = {
            headers: { Authorization: `Bearer ${user.token}` }
        };
        await axios.delete(`http://localhost:5000/api/auth/notices/${noticeId}`, config);
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
      <StudentHeader 
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
          <StudentSidebar 
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
            {breadcrumbItems}
          </Breadcrumbs>
          </div></div>
        
          
          <div className=" p-4 md:p-6 overflow-y-auto ">
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
                        <InputLabel>Select Class</InputLabel>
                        <Select
                            value={classId}
                            onChange={(e) => setClassId(e.target.value)}
                            label="Select Class"
                            required
                        >
                            {classes.map((cls) => (
                                <MenuItem key={cls._id} value={cls._id}>{cls.subject}</MenuItem>
                            ))}
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
                                setClassId("");
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
                                    Class: {notice.classId.subject}
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
        </div>
        </div>
        </div>
        </div>
    );
};

export default TeacherNotices;