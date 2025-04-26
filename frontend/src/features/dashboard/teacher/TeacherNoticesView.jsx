import { useState, useEffect } from "react";
import axios from "axios";
import {
    Box,
    Typography,
    Paper,
    Card,
    CardContent,
    Alert,
    CardActions,
    Button,
    Divider,
    Tabs,
    Tab
} from "@mui/material";
import useAuth from "../../../hooks/useAuth";
import {  useLocation, useParams, useNavigate } from "react-router-dom";

const TeacherNoticesView = () => {
    const { user } = useAuth();
    const { noticeId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [notices, setNotices] = useState([]);
    const [selectedNotice, setSelectedNotice] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [tabValue, setTabValue] = useState(0);

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
            navigate("/teacher/noticesview");
        }
    };

    const pathnames = location.pathname.split("/").filter((x) => x);
   

    const pageTitle = pathnames.length > 0 
        ? pathnames[pathnames.length - 1].charAt(0).toUpperCase() + pathnames[pathnames.length - 1].slice(1)
        : "Dashboard";

    useEffect(() => {
        document.title = `${pageTitle} - Teacher Dashboard - EduConnect`;
    }, [location, pageTitle]);

    return (
        <Box sx={{ maxWidth: 800, mx: "auto", p: 3, mt: "50px" }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h4" gutterBottom>Notices & Announcements View </Typography>
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
                                            onClick={() => navigate(`/teacher/noticesview/${notice._id}`)}
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
    );
};

export default TeacherNoticesView;