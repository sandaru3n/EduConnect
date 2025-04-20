// frontend/src/features/dashboard/teacher/UploadMaterial.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { Box, TextField, Button, Select, MenuItem, FormControl, InputLabel, Typography, Alert } from "@mui/material";

const UploadMaterial = ({ classId }) => {
    const [title, setTitle] = useState("");
    const [lessonName, setLessonName] = useState("");
    const [type, setType] = useState("pdf");
    const [content, setContent] = useState("");
    const [file, setFile] = useState(null);
    const [uploadDate, setUploadDate] = useState("");
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(classId || "");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("userInfo")).token}` }
                };
                const { data } = await axios.get("http://localhost:5000/api/teacher/classes", config);
                setClasses(data);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to fetch classes");
            }
        };
        fetchClasses();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const config = {
            headers: {
                Authorization: `Bearer ${userInfo.token}`,
                "Content-Type": "multipart/form-data"
            }
        };

        const formData = new FormData();
        formData.append("title", title);
        formData.append("lessonName", lessonName);
        formData.append("type", type);
        formData.append("uploadDate", uploadDate);
        
        if (type === "link") {
            formData.append("content", content);
        } else {
            formData.append("file", file);
        }

        try {
            await axios.post(
                `http://localhost:5000/api/teacher/classes/${selectedClass}/materials`,
                formData,
                config
            );
            setSuccess("Material uploaded successfully!");
            setTitle("");
            setLessonName("");
            setType("pdf");
            setContent("");
            setFile(null);
            setUploadDate("");
            setSelectedClass("");
        } catch (err) {
            setError(err.response?.data?.message || "Upload failed");
        }
    };

    return (
        <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
            <Typography variant="h4" gutterBottom>Upload Class Material</Typography>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
            <form onSubmit={handleSubmit}>
                <FormControl fullWidth margin="normal">
                    <InputLabel>Class</InputLabel>
                    <Select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        required
                    >
                        <MenuItem value="">Select Class</MenuItem>
                        {classes.map(cls => (
                            <MenuItem key={cls._id} value={cls._id}>{cls.subject}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    fullWidth
                    label="Lesson Name"
                    value={lessonName}
                    onChange={(e) => setLessonName(e.target.value)}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    label="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    margin="normal"
                    required
                />
                <FormControl fullWidth margin="normal">
                    <InputLabel>Type</InputLabel>
                    <Select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        required
                    >
                        <MenuItem value="pdf">PDF</MenuItem>
                        <MenuItem value="video">Video (MP4)</MenuItem>
                        <MenuItem value="link">Link</MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    fullWidth
                    label="Upload Date"
                    type="date"
                    value={uploadDate}
                    onChange={(e) => setUploadDate(e.target.value)}
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                    required
                />
                {type === "link" ? (
                    <TextField
                        fullWidth
                        label="URL"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        margin="normal"
                        required
                    />
                ) : (
                    <Box sx={{ mt: 2 }}>
                        <input
                            type="file"
                            accept={type === "pdf" ? ".pdf" : ".mp4"}
                            onChange={(e) => setFile(e.target.files[0])}
                            required
                        />
                    </Box>
                )}
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ mt: 3 }}
                >
                    Upload Material
                </Button>
            </form>
        </Box>
    );
};

export default UploadMaterial;