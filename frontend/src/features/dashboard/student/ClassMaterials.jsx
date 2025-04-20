//frontend/src/features/dashboard/student/ClassMaterials.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert
} from "@mui/material";

const ClassMaterials = () => {
    const { classId } = useParams();
    const [materials, setMaterials] = useState([]);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [timeLeft, setTimeLeft] = useState({});
    const [extendReason, setExtendReason] = useState("");
    const [extendError, setExtendError] = useState(null);
    const [extendSuccess, setExtendSuccess] = useState(null);

    useEffect(() => {
        fetchMaterials();
    }, [classId]);

    useEffect(() => {
        const timers = Object.keys(timeLeft).map(materialId => {
            if (timeLeft[materialId] > 0) {
                return setInterval(() => {
                    setTimeLeft(prev => ({
                        ...prev,
                        [materialId]: Math.max(0, prev[materialId] - 1)
                    }));
                }, 1000);
            }
            return null;
        });

        return () => timers.forEach(timer => timer && clearInterval(timer));
    }, [timeLeft]);

    const fetchMaterials = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };
            const { data } = await axios.get(
                `http://localhost:5000/api/classes/${classId}/materials`,
                config
            );

            const initialTimeLeft = {};
            data.forEach(material => {
                if (material.type === "video" && material.accessStartTime) {
                    const startTime = new Date(material.accessStartTime).getTime();
                    const expiryTime = startTime + 24 * 60 * 60 * 1000; // 24 hours
                    const now = Date.now();
                    initialTimeLeft[material._id] = expiryTime > now 
                        ? Math.floor((expiryTime - now) / 1000)
                        : 0;
                }
            });

            setMaterials(data);
            setTimeLeft(initialTimeLeft);
        } catch (err) {
            setError(err.response?.data?.message || "Error fetching materials");
        }
    };

    const handleStartVideo = async (material) => {
        if (window.confirm("Start watching this video? You will have 24 hours of access.")) {
            try {
                const userInfo = JSON.parse(localStorage.getItem("userInfo"));
                const config = {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                };
                await axios.post(
                    `http://localhost:5000/api/classes/${classId}/materials/${material._id}/start`,
                    {},
                    config
                );
                setTimeLeft(prev => ({
                    ...prev,
                    [material._id]: 24 * 60 * 60 // 24 hours in seconds
                }));
                fetchMaterials(); // Refresh materials to get updated access time
            } catch (err) {
                setError(err.response?.data?.message || "Error starting video");
            }
        }
    };

    const handleExtendRequest = async () => {
        if (!extendReason.trim()) {
            setExtendError("Please provide a reason for extension");
            return;
        }

        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };
            await axios.post(
                `http://localhost:5000/api/classes/${classId}/materials/${selectedMaterial._id}/extend`,
                { reason: extendReason },
                config
            );
            setExtendSuccess("Extension request submitted successfully");
            setExtendReason("");
            setOpenDialog(false);
        } catch (err) {
            setExtendError(err.response?.data?.message || "Error submitting extension request");
        }
    };

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours}h ${minutes}m ${secs}s`;
    };

    return (
        <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
            <Typography variant="h4" gutterBottom>Class Materials</Typography>
            {error && <Alert severity="error">{error}</Alert>}
            {materials.length === 0 ? (
                <Typography>No materials available</Typography>
            ) : (
                materials.map(material => (
                    <Card key={material._id} sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="h6">{material.lessonName}</Typography>
                            <Typography color="textSecondary">Title: {material.title}</Typography>
                            <Typography color="textSecondary">Type: {material.type}</Typography>
                            <Typography color="textSecondary">
                                Uploaded: {new Date(material.uploadDate).toLocaleDateString()}
                            </Typography>
                            {material.type === "video" && (
                                <>
                                    {timeLeft[material._id] > 0 ? (
                                        <>
                                            <Typography color="textSecondary">
                                                Time Left: {formatTime(timeLeft[material._id])}
                                            </Typography>
                                            <video controls width="100%" style={{ maxHeight: "400px" }}>
                                                <source src={`http://localhost:5000${material.content}`} type="video/mp4" />
                                                Your browser does not support the video tag.
                                            </video>
                                        </>
                                    ) : material.accessStartTime ? (
                                        <>
                                            <Typography color="error">Video access expired</Typography>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => {
                                                    setSelectedMaterial(material);
                                                    setOpenDialog(true);
                                                }}
                                            >
                                                Request Extension
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => handleStartVideo(material)}
                                        >
                                            Start Video
                                        </Button>
                                    )}
                                </>
                            )}
                            {material.type === "pdf" && (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    href={`http://localhost:5000${material.content}`}
                                    target="_blank"
                                >
                                    View PDF
                                </Button>
                            )}
                            {material.type === "link" && (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    href={material.content}
                                    target="_blank"
                                >
                                    Open Link
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ))
            )}

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Request Video Access Extension</DialogTitle>
                <DialogContent>
                    {extendError && <Alert severity="error">{extendError}</Alert>}
                    {extendSuccess && <Alert severity="success">{extendSuccess}</Alert>}
                    <TextField
                        fullWidth
                        label="Reason for Extension"
                        multiline
                        rows={4}
                        value={extendReason}
                        onChange={(e) => setExtendReason(e.target.value)}
                        margin="normal"
                        required
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleExtendRequest} variant="contained" color="primary">
                        Submit Request
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ClassMaterials;