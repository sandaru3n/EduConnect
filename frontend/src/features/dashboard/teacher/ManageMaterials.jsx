import { useState, useEffect } from "react";
import { Breadcrumbs, Link as MuiLink, Typography, Box, Grid, Card, CardContent, IconButton, Button, Modal, TextField, FormControl, InputLabel, Select, MenuItem, Alert } from "@mui/material";
import { Link, useLocation, useParams } from "react-router-dom";
import TeacherSidebar from "../../../components/TeacherSidebar/index";
import TeacherHeader from "../../../components/TeacherHeader/index";
import axios from "axios";
import { Edit, Delete, Visibility, ClassOutlined, InsertDriveFile, VideoLibrary, Link as LinkIcon, CalendarToday } from "@mui/icons-material";

const ClassMaterials = () => {
    const location = useLocation();
    const { classId } = useParams();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [materials, setMaterials] = useState([]);
    const [classData, setClassData] = useState(null);
    const [classes, setClasses] = useState([]);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [openEditModal, setOpenEditModal] = useState(false);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [editForm, setEditForm] = useState({
        title: "",
        lessonName: "",
        type: "",
        content: "",
        uploadDate: "",
        classId: "",
    });
    const [openDeleteConfirmModal, setOpenDeleteConfirmModal] = useState(false);
    const [materialIdToDelete, setMaterialIdToDelete] = useState(null);

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
        const fetchData = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem("userInfo"));
                const config = {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                };

                // Fetch teacher's classes (for the edit modal)
                const { data: classesData } = await axios.get("http://localhost:5000/api/teacher/classes", config);
                setClasses(classesData);

                // Fetch the selected class
                const { data: classData } = await axios.get(`http://localhost:5000/api/teacher/classes/${classId}`, config);
                setClassData(classData);

                // Fetch materials for the selected class
                const { data: materialsData } = await axios.get("http://localhost:5000/api/teacher/materials", config);
                const classMaterials = materialsData.filter(mat => mat.classId._id.toString() === classId);
                setMaterials(classMaterials);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to fetch data");
            }
        };
        fetchData();
    }, [classId]);

    const handleEditMaterial = (material) => {
        setSelectedMaterial(material);
        setEditForm({
            title: material.title,
            lessonName: material.lessonName,
            type: material.type,
            content: material.content,
            uploadDate: material.uploadDate ? new Date(material.uploadDate).toISOString().split('T')[0] : "",
            classId: material.classId._id,
        });
        setOpenEditModal(true);
    };

    const handleUpdateMaterial = async (e) => {
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
        formData.append("title", editForm.title);
        formData.append("lessonName", editForm.lessonName);
        formData.append("type", editForm.type);
        formData.append("uploadDate", editForm.uploadDate);
        formData.append("classId", editForm.classId);

        if (editForm.type === "link") {
            formData.append("content", editForm.content);
        } else if (editForm.file) {
            formData.append("file", editForm.file);
        } else {
            formData.append("content", selectedMaterial.content);
        }

        try {
            const { data } = await axios.put(
                `http://localhost:5000/api/teacher/materials/${selectedMaterial._id}`,
                formData,
                config
            );
            setSuccess("Material updated successfully!");

            // Update the materials list
            setMaterials(materials.map(mat => mat._id === data._id ? data : mat));
            setOpenEditModal(false);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update material");
        }
    };

    const handleDeleteMaterial = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };

            await axios.delete(`http://localhost:5000/api/teacher/materials/${materialIdToDelete}`, config);
            setSuccess("Material deleted successfully!");

            // Update the materials list
            setMaterials(materials.filter(mat => mat._id !== materialIdToDelete));
            setOpenDeleteConfirmModal(false);
            setMaterialIdToDelete(null);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete material");
            setOpenDeleteConfirmModal(false);
            setMaterialIdToDelete(null);
        }
    };

    const handleOpenDeleteConfirm = (materialId) => {
        setMaterialIdToDelete(materialId);
        setOpenDeleteConfirmModal(true);
    };

    const handleCloseDeleteConfirm = () => {
        setOpenDeleteConfirmModal(false);
        setMaterialIdToDelete(null);
    };

    const pathnames = location.pathname.split("/").filter((x) => x);
    const breadcrumbItems = [
        // Static "Dashboard" breadcrumb
        <MuiLink
            key="/teacher/dashboard"
            component={Link}
            to="/teacher/dashboard"
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
            Dashboard
        </MuiLink>,
        // Static "Classes" breadcrumb
        <MuiLink
            key="/teacher/classes"
            component={Link}
            to="/teacher/classes"
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
            Teacher
        </MuiLink>,
        // Static "Select" breadcrumb linking to the class selection page
        <MuiLink
            key="/teacher/classes/select"
            component={Link}
            to="/teacher/dashboard"
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
            Classes
        </MuiLink>,<MuiLink
            key="/teacher/classes/select"
            component={Link}
            to="/teacher/classes/select"
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
            Select
        </MuiLink>,
        // Dynamic breadcrumbs for the remaining path segments
        ...pathnames.map((value, index) => {
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
        })
    ];

    const pageTitle = pathnames.length > 0
        ? pathnames[pathnames.length - 1].charAt(0).toUpperCase() + pathnames[pathnames.length - 1].slice(1).replace(/-/g, ' ')
        : "Class Materials";

    useEffect(() => {
        document.title = `${pageTitle} - EduConnect`;
    }, [location, pageTitle]);

    return (
        <div className="bg-gray-50 min-h-screen">
            <TeacherHeader
                isSidebarCollapsed={isSidebarCollapsed}
                toggleSidebar={toggleSidebar}
                isMobile={isMobile}
            />
            <div className="flex min-h-screen">
                {/* Sidebar */}
                <div className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 ${
                    isSidebarCollapsed ? "w-[60px]" : "w-[18%] md:w-[250px]"
                } bg-white border-r border-gray-200`}>
                    <TeacherSidebar
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
                            {breadcrumbItems}
                        </Breadcrumbs>
                    </div>

                    {/* Materials List */}
                    <div className="mt-[104px] p-4 md:p-6 overflow-y-auto h-[calc(100vh-104px)]">
                        <Box sx={{ maxWidth: 1200, mx: "auto", p: 4 }}>
                            {/* Cover Photo Banner */}
                            <Box sx={{ mb: 4 }}>
                                <img
                                    src={classData && classData.coverPhoto 
                                        ? `http://localhost:5000${classData.coverPhoto}` 
                                        : "https://via.placeholder.com/1200x300?text=Class+Cover+Photo"}
                                    alt={classData ? `${classData.subject} Cover Photo` : "Class Cover Photo"}
                                    style={{
                                        width: '100%',
                                        height: '300px',
                                        objectFit: 'cover',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    }}
                                />
                            </Box>

                            <Typography variant="h4" gutterBottom sx={{ mb: 4, color: 'text.primary', fontWeight: 700 }}>
                                {classData ? `Materials for ${classData.subject}` : "Loading..."}
                            </Typography>

                            {(error || success) && (
                                <Alert severity={error ? 'error' : 'success'} sx={{ mb: 3 }}>
                                    {error || success}
                                </Alert>
                            )}

                            {materials.length === 0 ? (
                                <Typography variant="body1" color="text.secondary">
                                    No materials found for this class. Start by uploading materials.
                                </Typography>
                            ) : (
                                <Grid container spacing={3}>
                                    {materials.map(material => (
                                        <Grid item xs={12} md={6} lg={4} key={material._id}>
                                            <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: 3 }}>
                                                <CardContent>
                                                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
                                                        {material.title}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                        Lesson: {material.lessonName}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                        Type: {material.type.charAt(0).toUpperCase() + material.type.slice(1)}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                        Uploaded: {new Date(material.uploadDate).toLocaleDateString()}
                                                    </Typography>
                                                    {material.type === "link" ? (
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            startIcon={<Visibility />}
                                                            href={material.content}
                                                            target="_blank"
                                                            sx={{ mt: 1, mr: 1 }}
                                                        >
                                                            View
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="outlined"
                                                            size="small"
                                                            startIcon={<Visibility />}
                                                            href={`http://localhost:5000${material.content}`}
                                                            target="_blank"
                                                            sx={{ mt: 1, mr: 1 }}
                                                        >
                                                            View
                                                        </Button>
                                                    )}
                                                    <IconButton
                                                        color="primary"
                                                        onClick={() => handleEditMaterial(material)}
                                                        sx={{ mt: 1 }}
                                                    >
                                                        <Edit />
                                                    </IconButton>
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => handleOpenDeleteConfirm(material._id)}
                                                        sx={{ mt: 1 }}
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </Box>
                    </div>
                </div>
            </div>

            {/* Edit Material Modal */}
            <Modal open={openEditModal} onClose={() => setOpenEditModal(false)}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: '90%', md: 600 },
                    bgcolor: 'background.paper',
                    borderRadius: 4,
                    boxShadow: 24,
                    p: 4,
                    maxHeight: '90vh',
                    overflowY: 'auto'
                }}>
                    <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                        Edit Material
                    </Typography>
                    {(error || success) && (
                        <Alert severity={error ? 'error' : 'success'} sx={{ mb: 3 }}>
                            {error || success}
                        </Alert>
                    )}
                    <form onSubmit={handleUpdateMaterial}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel>Class</InputLabel>
                                    <Select
                                        value={editForm.classId}
                                        onChange={(e) => setEditForm({ ...editForm, classId: e.target.value })}
                                        required
                                        startAdornment={<ClassOutlined sx={{ color: 'action.active', mr: 1 }} />}
                                    >
                                        <MenuItem value="">Select Class</MenuItem>
                                        {classes.map(cls => (
                                            <MenuItem key={cls._id} value={cls._id}>{cls.subject}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Lesson Name"
                                    value={editForm.lessonName}
                                    onChange={(e) => setEditForm({ ...editForm, lessonName: e.target.value })}
                                    required
                                    InputProps={{
                                        startAdornment: (
                                            <VideoLibrary sx={{ color: 'action.active', mr: 1 }} />
                                        ),
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Material Title"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    required
                                    InputProps={{
                                        startAdornment: (
                                            <InsertDriveFile sx={{ color: 'action.active', mr: 1 }} />
                                        ),
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Content Type</InputLabel>
                                    <Select
                                        value={editForm.type}
                                        onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                                        required
                                    >
                                        <MenuItem value="pdf">PDF Document</MenuItem>
                                        <MenuItem value="video">Video File</MenuItem>
                                        <MenuItem value="link">External Link</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Upload Date"
                                    type="date"
                                    value={editForm.uploadDate}
                                    onChange={(e) => setEditForm({ ...editForm, uploadDate: e.target.value })}
                                    InputLabelProps={{ shrink: true }}
                                    required
                                    InputProps={{
                                        startAdornment: (
                                            <CalendarToday sx={{ color: 'action.active', mr: 1 }} />
                                        ),
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                {editForm.type === "link" ? (
                                    <TextField
                                        fullWidth
                                        label="Content URL"
                                        value={editForm.content}
                                        onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                                        required
                                        InputProps={{
                                            startAdornment: (
                                                <LinkIcon sx={{ color: 'action.active', mr: 1 }} />
                                            ),
                                        }}
                                    />
                                ) : (
                                    <Box sx={{
                                        border: 1,
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                        p: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2
                                    }}>
                                        <Button
                                            variant="contained"
                                            component="label"
                                            startIcon={<InsertDriveFile />}
                                        >
                                            Update {editForm.type === 'pdf' ? 'PDF' : 'MP4'}
                                            <input
                                                type="file"
                                                hidden
                                                accept={editForm.type === "pdf" ? ".pdf" : ".mp4"}
                                                onChange={(e) => setEditForm({ ...editForm, file: e.target.files[0] })}
                                            />
                                        </Button>
                                        {editForm.file ? (
                                            <Typography variant="body2" color="textSecondary">
                                                Selected: {editForm.file.name}
                                            </Typography>
                                        ) : (
                                            <Typography variant="body2" color="textSecondary">
                                                Current: {selectedMaterial?.content.split('/').pop()}
                                            </Typography>
                                        )}
                                    </Box>
                                )}
                            </Grid>

                            <Grid item xs={12}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    sx={{
                                        mt: 2,
                                        py: 1.5,
                                        fontSize: 16,
                                        fontWeight: 600,
                                        background: 'linear-gradient(45deg, #4f46e5 30%, #6366f1 90%)',
                                        '&:hover': {
                                            background: 'linear-gradient(45deg, #4338ca 30%, #4f46e5 90%)',
                                        }
                                    }}
                                    startIcon={<InsertDriveFile />}
                                >
                                    Update Material
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Box>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal open={openDeleteConfirmModal} onClose={handleCloseDeleteConfirm}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: '90%', md: 400 },
                    bgcolor: 'background.paper',
                    borderRadius: 4,
                    boxShadow: 24,
                    p: 4,
                    textAlign: 'center'
                }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
                        Confirm Deletion
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                        Are you sure you want to delete this material? This action cannot be undone.
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleDeleteMaterial}
                            sx={{ fontWeight: 600 }}
                        >
                            Yes, Delete
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={handleCloseDeleteConfirm}
                            sx={{ fontWeight: 600 }}
                        >
                            No, Cancel
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </div>
    );
};

export default ClassMaterials;