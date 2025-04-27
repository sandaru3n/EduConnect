import { useState, useEffect } from "react";
import { Breadcrumbs, Link as MuiLink, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import InstituteSidebar from "../../../components/InstituteSidebar/index";
import InstituteHeader from "../../../components/InstituteHeader/index";

import axios from "axios";
import {
    Box,
    Paper,
    Card,
    CardContent,
    CardActions,
    Button,
    Alert,
    Divider,
    Tabs,
    Tab,
} from "@mui/material";
import useAuth from "../../../hooks/useAuth";
import { useParams, useNavigate } from "react-router-dom";

const InstituteNoticesView = () => {
    const { user } = useAuth();
    const { noticeId } = useParams();
    const navigate = useNavigate();
    const [notices, setNotices] = useState([]);
    const [selectedNotice, setSelectedNotice] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const location = useLocation();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    const pathnames = location.pathname.split("/").filter((x) => x);
    const pageTitle = pathnames.length > 0 
        ? pathnames[pathnames.length - 1].charAt(0).toUpperCase() + pathnames[pathnames.length - 1].slice(1)
        : "Dashboard"; // Default title if no pathnames

    useEffect(() => {
        const fetchNotices = async () => {
            setLoading(true);
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` }
                };
                const { data } = await axios.get("http://localhost:5000/api/auth/admin/notices/user", config);
                setNotices(data || []);

                if (noticeId) {
                    const { data: noticeData } = await axios.get(`http://localhost:5000/api/auth/admin/notices/teacher-institute/${noticeId}`, config);
                    setSelectedNotice(noticeData);
                    setTabValue(1);

                    // Mark the notice as read
                    await axios.post(`http://localhost:5000/api/auth/notices/${noticeId}/read`, {}, config);
                    setNotices(prevNotices => 
                        prevNotices.map(notice => 
                            notice._id === noticeId ? { ...notice, unread: false } : notice
                        )
                    );
                }
            } catch (err) {
                setError(err.response?.data?.message || "Error loading notices");
                setNotices([]);
            } finally {
                setLoading(false);
            }
        };
        fetchNotices();
    }, [user.token, noticeId]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        if (newValue === 0) {
            setSelectedNotice(null);
            navigate("/institute/notices");
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

    // Update document title when location changes
    useEffect(() => {
        document.title = `TeacherDashboard - EduConnect`; // You can customize the format
    }, [location, pageTitle]);

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
                        <Breadcrumbs aria-label="breadcrumb">
                            <MuiLink component={Link} to="/student" underline="hover" color="inherit">
                                Student
                            </MuiLink>
                            {breadcrumbItems}
                        </Breadcrumbs>
                    </div>
                    
                    <div className="mt-[90px] p-4 md:p-6 overflow-y-auto h-[calc(100vh-90px)]">
                        <Box sx={{ maxWidth: 800, mx: "auto", p: 3, mt: "50px" }}>
                            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                                <Typography variant="h4" gutterBottom>Notices & Announcements</Typography>
                                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                                <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
                                    <Tab label="All Notices" />
                                    <Tab label="View Notice" disabled={!selectedNotice} />
                                </Tabs>
                                <Divider sx={{ mb: 3 }} />
                                {tabValue === 0 ? (
                                    loading ? (
                                        <Typography variant="body1" color="text.secondary">
                                            Loading notices...
                                        </Typography>
                                    ) : notices.length > 0 ? (
                                        notices.map((notice) => (
                                            notice && (
                                                <Card key={notice._id} sx={{ mt: 2, borderRadius: 2, boxShadow: 3 }}>
                                                    <CardContent>
                                                        <Typography variant="h6">
                                                            {notice.title}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            From: {notice.adminId?.name || "Admin"}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Date: {new Date(notice.date).toLocaleDateString()}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ mt: 1 }}>
                                                            {notice.description.length > 100
                                                                ? notice.description.substring(0, 100) + "..."
                                                                : notice.description}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                            Published: {new Date(notice.createdAt).toLocaleString()}
                                                        </Typography>
                                                    </CardContent>
                                                    <CardActions>
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            onClick={() => navigate(`/institute/notice/${notice._id}`)}
                                                            sx={{ textTransform: 'none' }}
                                                        >
                                                            View Full Notice
                                                        </Button>
                                                    </CardActions>
                                                </Card>
                                            )
                                        ))
                                    ) : (
                                        <Typography variant="body1" color="text.secondary">
                                            No notices available.
                                        </Typography>
                                    )
                                ) : selectedNotice ? (
                                    <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
                                        <CardContent>
                                            <Typography variant="h5" gutterBottom>
                                                {selectedNotice.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                From: {selectedNotice.adminId?.name || "Admin"}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Date: {new Date(selectedNotice.date).toLocaleDateString()}
                                            </Typography>
                                            <Typography variant="body1" sx={{ mt: 2 }}>
                                                {selectedNotice.description}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                                Published: {new Date(selectedNotice.createdAt).toLocaleString()}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <Typography variant="body1" color="text.secondary">
                                        No notice selected.
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

export default InstituteNoticesView;