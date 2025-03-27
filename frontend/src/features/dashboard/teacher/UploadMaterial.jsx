import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  AlertTitle,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  InputAdornment,
  Tooltip,
  Snackbar,
  Chip,
  LinearProgress
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  VideoLibrary as VideoIcon,
  Link as LinkIcon,
  InsertDriveFile as DocumentIcon,
  Description as DescriptionIcon,
  Save as SaveIcon,
  CheckCircle as SuccessIcon,
  Cancel as CancelIcon,
  Delete as DeleteIcon,
  ArrowBack as BackIcon,
  Help as HelpIcon,
  Article as MaterialIcon,
  Book as BookIcon
} from "@mui/icons-material";

// Material types with icons and colors
const materialTypes = [
  { value: "video", label: "Video", icon: <VideoIcon />, color: "#f44336", description: "Upload a video link (YouTube, Vimeo, etc.)" },
  { value: "link", label: "External Link", icon: <LinkIcon />, color: "#2196f3", description: "Link to external website or resource" },
  { value: "document", label: "Document", icon: <DocumentIcon />, color: "#4caf50", description: "Upload PDF, Word, or other documents" }
];

const UploadMaterial = ({ classId }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "video",
    content: ""
  });
  const [file, setFile] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(classId || "");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const navigate = useNavigate();

  // Load available classes for the teacher
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const config = {
          headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("userInfo")).token}` }
        };
        const { data } = await axios.get("http://localhost:5000/api/teacher/classes", config);
        setClasses(data);

        // Set default selected class if provided
        if (classId && !selectedClass) {
          setSelectedClass(classId);
        } else if (data.length > 0 && !selectedClass) {
          setSelectedClass(data[0]._id);
        }

        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load classes");
        setLoading(false);
      }
    };

    fetchClasses();
  }, [classId]);

  // Generate preview for uploaded files
  useEffect(() => {
    if (file) {
      // Create preview URL for supported file types
      if (file.type.includes("pdf") || file.type.includes("image")) {
        const fileUrl = URL.createObjectURL(file);
        setPreviewUrl(fileUrl);

        // Clean up the URL when component unmounts
        return () => URL.revokeObjectURL(fileUrl);
      } else {
        setPreviewUrl("");
      }
    }
  }, [file]);

  // Generate preview for videos
  useEffect(() => {
    if (formData.type === "video" && formData.content) {
      // Extract YouTube video ID if present
      if (formData.content.includes("youtube.com") || formData.content.includes("youtu.be")) {
        let videoId = "";
        if (formData.content.includes("youtube.com/watch?v=")) {
          videoId = formData.content.split("v=")[1];
        } else if (formData.content.includes("youtu.be/")) {
          videoId = formData.content.split("youtu.be/")[1];
        }

        if (videoId) {
          // Remove additional URL parameters if present
          videoId = videoId.split("&")[0];
          setPreviewUrl(`https://img.youtube.com/vi/${videoId}/0.jpg`);
          return;
        }
      }

      // Handle other video platforms here
      setPreviewUrl("");
    }
  }, [formData.type, formData.content]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Reset file when type changes
    if (name === "type" && value !== "document") {
      setFile(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!selectedClass) {
      setError("Please select a class for this material");
      return;
    }

    if (!formData.title.trim()) {
      setError("Material title is required");
      return;
    }

    if (formData.type !== "document" && !formData.content.trim()) {
      setError(`Please provide a ${formData.type === "video" ? "video URL" : "link URL"}`);
      return;
    }

    if (formData.type === "document" && !file) {
      setError("Please select a file to upload");
      return;
    }

    try {
      setUploading(true);
      setProgress(0);
      setError(null);

      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("type", formData.type);
      formDataToSend.append("description", formData.description);

      if (formData.type === "document") {
        formDataToSend.append("file", file);
      } else {
        formDataToSend.append("content", formData.content);
      }

      // Progress tracking for uploads
      const progressConfig = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
          "Content-Type": "multipart/form-data"
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        }
      };

      await axios.post(
        `http://localhost:5000/api/teacher/classes/${selectedClass}/materials`,
        formDataToSend,
        progressConfig
      );

      setSuccess(true);

      // Reset form after successful upload
      setTimeout(() => {
        resetForm();
        // Optional: navigate to class materials page
        navigate(`/teacher/classes/${selectedClass}`);
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || "Error uploading material");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "video",
      content: ""
    });
    setFile(null);
    setPreviewUrl("");
  };

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel? Any unsaved changes will be lost.")) {
      navigate(`/teacher/classes/${selectedClass}`);
    }
  };

  const getSelectedClass = () => {
    if (!selectedClass) return null;
    return classes.find(cls => cls._id === selectedClass);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper
        elevation={3}
        sx={{
          borderRadius: 2,
          overflow: 'hidden'
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            p: 3,
            bgcolor: '#4f46e5',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <MaterialIcon fontSize="large" />
          <Box>
            <Typography variant="h5" component="h1" fontWeight="bold">
              Upload Learning Material
            </Typography>
            <Typography variant="body2">
              {getSelectedClass()
                ? `Adding materials to ${getSelectedClass().subject}`
                : "Select a class and upload materials for your students"}
            </Typography>
          </Box>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            sx={{
              mx: 3,
              mt: 3,
              borderRadius: 1,
              '& .MuiAlert-icon': {
                alignItems: 'center'
              }
            }}
            onClose={() => setError(null)}
          >
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        )}

        {/* Main Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Class Selection */}
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="class-select-label">Select Class *</InputLabel>
                <Select
                  labelId="class-select-label"
                  id="class-select"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  label="Select Class *"
                  required
                  disabled={loading || !!classId}
                  startAdornment={
                    <InputAdornment position="start">
                      <BookIcon fontSize="small" color="action" />
                    </InputAdornment>
                  }
                >
                  {classes.length === 0 ? (
                    <MenuItem disabled value="">
                      {loading ? "Loading classes..." : "No classes found"}
                    </MenuItem>
                  ) : (
                    classes.map(cls => (
                      <MenuItem key={cls._id} value={cls._id}>
                        {cls.subject}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>

            {/* Title */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Material Title *"
                name="title"
                value={formData.title}
                onChange={handleChange}
                variant="outlined"
                required
                placeholder="E.g., Introduction to Algebra, Week 3 Assignment, etc."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DescriptionIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description (Optional)"
                name="description"
                value={formData.description}
                onChange={handleChange}
                variant="outlined"
                placeholder="Provide a description of this material to help students understand its purpose and content."
              />
            </Grid>

            {/* Material Type Selection */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="medium" color="text.secondary" gutterBottom>
                Material Type
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                {materialTypes.map((type) => (
                  <Grid item xs={12} sm={4} key={type.value}>
                    <Card
                      onClick={() => setFormData({...formData, type: type.value})}
                      sx={{
                        borderRadius: 2,
                        cursor: 'pointer',
                        height: '100%',
                        border: formData.type === type.value
                          ? `2px solid ${type.color}`
                          : '2px solid transparent',
                        boxShadow: formData.type === type.value ? 3 : 1,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          boxShadow: 3,
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <CardContent sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        p: 2
                      }}>
                        <Box
                          sx={{
                            color: 'white',
                            bgcolor: type.color,
                            borderRadius: '50%',
                            width: 50,
                            height: 50,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 1
                          }}
                        >
                          {type.icon}
                        </Box>
                        <Typography variant="h6" component="div" fontWeight="medium">
                          {type.label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {type.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Material Content - Based on Type */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="medium" color="text.secondary" gutterBottom>
                Material Content
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            {/* Video or Link URL input */}
            {formData.type !== "document" && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={formData.type === "video" ? "Video URL *" : "Link URL *"}
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  variant="outlined"
                  required
                  placeholder={
                    formData.type === "video"
                      ? "https://www.youtube.com/watch?v=..."
                      : "https://example.com/resource"
                  }
                  helperText={
                    formData.type === "video"
                      ? "YouTube, Vimeo, or other video platform URLs"
                      : "Website, article, or other external resource"
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {formData.type === "video" ? <VideoIcon color="action" /> : <LinkIcon color="action" />}
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            )}

            {/* Document Upload */}
            {formData.type === "document" && (
              <Grid item xs={12}>
                <Box
                  sx={{
                    border: '2px dashed #ccc',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    bgcolor: 'rgba(0,0,0,0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: '#4f46e5',
                      bgcolor: 'rgba(79, 70, 229, 0.03)'
                    }
                  }}
                  onClick={() => document.getElementById('file-upload').click()}
                >
                  <input
                    id="file-upload"
                    type="file"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />

                  {file ? (
                    <Box>
                      <Chip
                        icon={<DocumentIcon />}
                        label={file.name}
                        color="primary"
                        onDelete={() => setFile(null)}
                        sx={{ mb: 2 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <UploadIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="body1" gutterBottom>
                        Drag and drop a file here or click to browse
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Supports PDF, DOCX, PPTX, images, and other document formats (max 25MB)
                      </Typography>
                    </>
                  )}
                </Box>
              </Grid>
            )}

            {/* Preview Section */}
            {previewUrl && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" fontWeight="medium" color="text.secondary" gutterBottom>
                  Preview
                </Typography>

                <Paper
                  elevation={1}
                  sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    maxHeight: 250
                  }}
                >
                  {formData.type === "video" ? (
                    <Box
                      sx={{
                        position: 'relative',
                        height: 200,
                        backgroundImage: `url(${previewUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Box
                        sx={{
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          bgcolor: 'rgba(0,0,0,0.6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <VideoIcon sx={{ color: 'white', fontSize: 30 }} />
                      </Box>
                    </Box>
                  ) : file?.type.includes('pdf') ? (
                    <Box sx={{ height: 200, overflow: 'hidden' }}>
                      <object
                        data={previewUrl}
                        type="application/pdf"
                        width="100%"
                        height="100%"
                      >
                        <Typography sx={{ p: 2 }}>
                          PDF preview not available
                        </Typography>
                      </object>
                    </Box>
                  ) : file?.type.includes('image') ? (
                    <Box
                      component="img"
                      src={previewUrl}
                      sx={{
                        width: '100%',
                        maxHeight: 200,
                        objectFit: 'contain'
                      }}
                      alt="Material preview"
                    />
                  ) : (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <DocumentIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                      <Typography>
                        {file?.name}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            )}

            {/* Upload Progress */}
            {uploading && (
              <Grid item xs={12}>
                <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="primary">
                    Uploading material...
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {progress}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 8,
                    borderRadius: 1,
                    bgcolor: 'rgba(79, 70, 229, 0.1)'
                  }}
                />
              </Grid>
            )}

            {/* Form Controls */}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<BackIcon />}
                onClick={handleCancel}
                sx={{ borderRadius: 1 }}
                disabled={uploading}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                disabled={uploading}
                sx={{
                  borderRadius: 1,
                  bgcolor: "#4f46e5",
                  '&:hover': {
                    bgcolor: "#4338ca"
                  }
                }}
              >
                {uploading ? "Uploading..." : "Upload Material"}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Success Message */}
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSuccess(false)}
          severity="success"
          sx={{ width: '100%' }}
          variant="filled"
        >
          Material uploaded successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UploadMaterial;
