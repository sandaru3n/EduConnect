import { useState, useEffect, useRef } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
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
    Alert,
    Breadcrumbs,
    Divider,
    Grid,
    Link as MuiLink,
    Slider,
    IconButton
} from "@mui/material";
import StudentSidebar from "../../../components/StudentSidebar/index";
import StudentHeader from "../../../components/StudentHeader/index";
import { Visibility, VolumeUp, VolumeOff, Replay, PlayArrow, Pause } from "@mui/icons-material";
import ReactPlayer from "react-player";

const ClassMaterials = () => {
    const { classId } = useParams();
    const location = useLocation();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [materials, setMaterials] = useState([]);
    const [groupedMaterials, setGroupedMaterials] = useState({});
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [timeLeft, setTimeLeft] = useState({});
    const [extendReason, setExtendReason] = useState("");
    const [extendError, setExtendError] = useState(null);
    const [extendSuccess, setExtendSuccess] = useState(null);
    const [openVideoConfirmDialog, setOpenVideoConfirmDialog] = useState(false);
    const [materialToWatch, setMaterialToWatch] = useState(null);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [playing, setPlaying] = useState({}); // Track play/pause state for each video

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
            const initialPlaying = {};
            data.forEach(material => {
                if (material.type === "video" && material.accessStartTime) {
                    const startTime = new Date(material.accessStartTime).getTime();
                    const duration = material.extensionApproved ? 6 : 24;
                    const expiryTime = startTime + duration * 60 * 60 * 1000;
                    const now = Date.now();
                    initialTimeLeft[material._id] = expiryTime > now 
                        ? Math.floor((expiryTime - now) / 1000)
                        : 0;
                }
                initialPlaying[material._id] = false; // Initialize all videos as paused
            });

            const grouped = data.reduce((acc, material) => {
                const date = new Date(material.uploadDate);
                const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
                if (!acc[monthYear]) {
                    acc[monthYear] = [];
                }
                acc[monthYear].push(material);
                return acc;
            }, {});

            Object.keys(grouped).forEach(month => {
                grouped[month].sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
            });

            const sortedGrouped = Object.keys(grouped)
                .sort((a, b) => {
                    const dateA = new Date(a);
                    const dateB = new Date(b);
                    return dateB - dateA;
                })
                .reduce((acc, key) => {
                    acc[key] = grouped[key];
                    return acc;
                }, {});

            setMaterials(data);
            setGroupedMaterials(sortedGrouped);
            setTimeLeft(initialTimeLeft);
            setPlaying(initialPlaying);
        } catch (err) {
            setError(err.response?.data?.message || "Error fetching materials");
        }
    };

    const handleOpenVideoConfirm = (material) => {
        setMaterialToWatch(material);
        setOpenVideoConfirmDialog(true);
    };

    const handleCloseVideoConfirm = () => {
        setOpenVideoConfirmDialog(false);
        setMaterialToWatch(null);
    };

    const handleStartVideo = async () => {
        if (!materialToWatch) return;

        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };
            const { data } = await axios.post(
                `http://localhost:5000/api/classes/${classId}/materials/${materialToWatch._id}/start`,
                {},
                config
            );
            setTimeLeft(prev => ({
                ...prev,
                [materialToWatch._id]: (data.isExtended ? 6 : 24) * 60 * 60
            }));
            fetchMaterials();
            handleCloseVideoConfirm();
        } catch (err) {
            setError(err.response?.data?.message || "Error starting video");
            handleCloseVideoConfirm();
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
            fetchMaterials();
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

    const togglePlayPause = (materialId) => {
        setPlaying(prev => ({
            ...prev,
            [materialId]: !prev[materialId]
        }));
    };

    const handlePlaybackSpeedChange = (materialId, speed) => {
        setPlaybackSpeed(speed);
    };

    const handleVolumeChange = (materialId, newValue) => {
        setVolume(newValue);
        setIsMuted(newValue === 0);
    };

    const toggleMute = (materialId) => {
        setIsMuted(prev => !prev);
        setVolume(prev => (prev === 0 ? 1 : 0));
    };

    const seekToStart = (materialId) => {
        setPlaying(prev => ({ ...prev, [materialId]: true }));
    };

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
                    fontSize: { xs: '0.85rem', md: '0.875rem' },
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
                    fontSize: { xs: '0.85rem', md: '0.875rem' },
                    '&:hover': {
                        textDecoration: 'underline',
                    },
                }}
            >
                {displayName}
            </MuiLink>
        );
    });

    const pageTitle = pathnames.length > 0
        ? pathnames[pathnames.length - 1].charAt(0).toUpperCase() + pathnames[pathnames.length - 1].slice(1).replace(/-/g, ' ')
        : "Class Materials";

    useEffect(() => {
        document.title = `${pageTitle} - EduConnect`;
    }, [location, pageTitle]);

    return (
        <div className="bg-gray-50 min-h-screen">
            <StudentHeader
                isSidebarCollapsed={isSidebarCollapsed}
                toggleSidebar={toggleSidebar}
                isMobile={isMobile}
            />
            <div className="flex min-h-screen">
                {/* Sidebar */}
                <div className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 ${
                    isSidebarCollapsed ? "w-[60px]" : "w-[18%] md:w-[250px]"
                } bg-white border-r border-gray-200`}>
                    <StudentSidebar
                        isCollapsed={isSidebarCollapsed}
                        toggleSidebar={toggleSidebar}
                    />
                </div>

                {/* Main Content */}
                <div className={`flex-1 transition-all duration-300 ${
                    isSidebarCollapsed ? "ml-[60px]" : "ml-[18%] md:ml-[250px]"
                }`}>
                    {/* Breadcrumbs */}
                    <div className={`py-3 px-4 md:px-6 fixed top-[64px] right-2 z-30 transition-all duration-300 ${
                        isSidebarCollapsed ? "ml-[60px] w-[calc(100%-60px)]" : "ml-[18%] w-[calc(100%-18%)] md:ml-[250px] md:w-[calc(100%-250px)]"
                    } bg-white border-b border-gray-200 shadow-sm`}>
                        <Breadcrumbs aria-label="breadcrumb" separator="›" className="text-gray-600">
                            <MuiLink component={Link} to="/student/dashboard" className="hover:text-blue-600">
                                Dashboard
                            </MuiLink>
                            {breadcrumbItems}
                        </Breadcrumbs>
                    </div>

                    {/* Materials List */}
                    <div className="mt-[104px] p-4 md:p-6 overflow-y-auto h-[calc(100vh-104px)]">
                        <Box sx={{ maxWidth: 1200, mx: "auto", p: 4 }}>
                            <Typography variant="h4" gutterBottom sx={{ mb: 4, color: 'text.primary', fontWeight: 700 }}>
                                Class Materials
                            </Typography>

                            {error && (
                                <Alert severity="error" sx={{ mb: 3 }}>
                                    {error}
                                </Alert>
                            )}

                            {Object.keys(groupedMaterials).length === 0 ? (
                                <Typography variant="body1" color="text.secondary">
                                    No materials available for this class.
                                </Typography>
                            ) : (
                                Object.keys(groupedMaterials).map(month => (
                                    <Box key={month} sx={{ mb: 6 }}>
                                        <Typography variant="h5" sx={{ mb: 3, color: 'text.primary', fontWeight: 600, bgcolor: '#f0f4f8', p: 2, borderRadius: 2 }}>
                                            {month}
                                        </Typography>
                                        <Divider sx={{ mb: 3 }} />
                                        <Grid container spacing={3}>
                                            {groupedMaterials[month].map(material => (
                                                <Grid item xs={12} key={material._id}>
                                                    <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: 3, mb: 2, bgcolor: '#fff' }}>
                                                        <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                            <Box sx={{ flex: 1 }}>
                                                                <Typography variant="h6" sx={{ fontWeight: 500, color: 'text.primary' }}>
                                                                    {material.lessonName}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                                    Title: {material.title}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                                    Type: {material.type.charAt(0).toUpperCase() + material.type.slice(1)}
                                                                </Typography>
                                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                                    Uploaded: {new Date(material.uploadDate).toLocaleDateString()}
                                                                </Typography>
                                                                {material.type === "video" && (
                                                                    <>
                                                                        {timeLeft[material._id] > 0 ? (
                                                                            <>
                                                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                                                    Time Left: {formatTime(timeLeft[material._id])}
                                                                                </Typography>
                                                                                <Box sx={{ position: 'relative', mt: 1 }}>
                                                                                    <ReactPlayer
                                                                                        url={`http://localhost:5000${material.content}`}
                                                                                        playing={playing[material._id] || false}
                                                                                        playbackRate={playbackSpeed}
                                                                                        volume={isMuted ? 0 : volume}
                                                                                        width="100%"
                                                                                        height="400px"
                                                                                        controls={false}
                                                                                        onContextMenu={(e) => e.preventDefault()}
                                                                                        config={{
                                                                                            file: {
                                                                                                attributes: {
                                                                                                    onContextMenu: (e) => e.preventDefault(),
                                                                                                    controlsList: "nodownload"
                                                                                                }
                                                                                            }
                                                                                        }}
                                                                                    />
                                                                                </Box>
                                                                                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                                    <IconButton onClick={() => togglePlayPause(material._id)}>
                                                                                        {playing[material._id] ? <Pause /> : <PlayArrow />}
                                                                                    </IconButton>
                                                                                    <Typography variant="body2" color="text.secondary">
                                                                                        Speed:
                                                                                    </Typography>
                                                                                    {[1, 2, 3].map(speed => (
                                                                                        <Button
                                                                                            key={speed}
                                                                                            variant={playbackSpeed === speed ? "contained" : "outlined"}
                                                                                            size="small"
                                                                                            onClick={() => handlePlaybackSpeedChange(material._id, speed)}
                                                                                            sx={{ minWidth: '40px' }}
                                                                                        >
                                                                                            {speed}x
                                                                                        </Button>
                                                                                    ))}
                                                                                    <IconButton onClick={() => toggleMute(material._id)}>
                                                                                        {isMuted ? <VolumeOff /> : <VolumeUp />}
                                                                                    </IconButton>
                                                                                    <Slider
                                                                                        value={isMuted ? 0 : volume}
                                                                                        onChange={(e, newValue) => handleVolumeChange(material._id, newValue)}
                                                                                        min={0}
                                                                                        max={1}
                                                                                        step={0.01}
                                                                                        sx={{ width: '100px' }}
                                                                                    />
                                                                                    <IconButton onClick={() => seekToStart(material._id)}>
                                                                                        <Replay />
                                                                                    </IconButton>
                                                                                </Box>
                                                                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                                                                    Note: Video downloading is prohibited. For enhanced security, consider using a DRM service like VdoCipher.
                                                                                </Typography>
                                                                            </>
                                                                        ) : material.accessStartTime ? (
                                                                            <>
                                                                                <Typography variant="body2" color="error" sx={{ mt: 0.5 }}>
                                                                                    Video access expired
                                                                                </Typography>
                                                                                <Button
                                                                                    variant="contained"
                                                                                    color="primary"
                                                                                    onClick={() => {
                                                                                        setSelectedMaterial(material);
                                                                                        setOpenDialog(true);
                                                                                    }}
                                                                                    sx={{ mt: 1 }}
                                                                                >
                                                                                    Request Extension
                                                                                </Button>
                                                                            </>
                                                                        ) : (
                                                                            <Button
                                                                                variant="contained"
                                                                                color="primary"
                                                                                onClick={() => handleOpenVideoConfirm(material)}
                                                                                sx={{ mt: 1 }}
                                                                            >
                                                                                Watch Video
                                                                            </Button>
                                                                        )}
                                                                    </>
                                                                )}
                                                            </Box>
                                                            <Box>
                                                                {material.type === "pdf" && (
                                                                    <Button
                                                                        variant="outlined"
                                                                        color="primary"
                                                                        href={`http://localhost:5000${material.content}`}
                                                                        target="_blank"
                                                                        startIcon={<Visibility />}
                                                                        sx={{ fontWeight: 500 }}
                                                                    >
                                                                        View PDF
                                                                    </Button>
                                                                )}
                                                                {material.type === "link" && (
                                                                    <Button
                                                                        variant="outlined"
                                                                        color="primary"
                                                                        href={material.content}
                                                                        target="_blank"
                                                                        startIcon={<Visibility />}
                                                                        sx={{ fontWeight: 500 }}
                                                                    >
                                                                        Open Link
                                                                    </Button>
                                                                )}
                                                            </Box>
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                ))
                            )}
                        </Box>
                    </div>
                </div>
            </div>

            {/* Video Start Confirmation Dialog */}
            <Dialog open={openVideoConfirmDialog} onClose={handleCloseVideoConfirm}>
                <DialogTitle>Confirm Video Access</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
                        {materialToWatch?.extensionApproved
                            ? "Start watching this video? You will have 6 hours of access."
                            : "Start watching this video? You will have 24 hours of access."}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseVideoConfirm} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleStartVideo} variant="contained" color="primary">
                        Yes, Watch
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Extension Request Dialog */}
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
                        variant="outlined"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleExtendRequest} variant="contained" color="primary">
                        Submit Request
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ClassMaterials;