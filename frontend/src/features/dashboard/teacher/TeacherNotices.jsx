import { useState, useEffect } from "react";
import axios from "axios";
import {
    Box,
    Typography,
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

    return (
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
    );
};

export default TeacherNotices;