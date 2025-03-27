import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  InputAdornment,
  Alert,
  AlertTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  CircularProgress,
  Tooltip,
  Chip,
  Snackbar
} from "@mui/material";
import {
  School as SchoolIcon,
  AttachMoney as MoneyIcon,
  Description as DescriptionIcon,
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon
} from "@mui/icons-material";

const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Geography",
  "English",
  "Literature",
  "Computer Science",
  "Physical Education",
  "Art",
  "Music",
  "Foreign Languages",
  "Economics",
  "Business Studies",
  "Other"
];

const CreateClass = () => {
  const [formData, setFormData] = useState({
    subject: "",
    monthlyFee: "",
    description: "",
    difficulty: "Intermediate",
    format: "Hybrid",
    maxStudents: "15",
    schedule: ""
  });

  const [isCustomSubject, setIsCustomSubject] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Check if we need to show custom subject field
    if (name === "subject" && value === "Other") {
      setIsCustomSubject(true);
      setFormData(prev => ({
        ...prev,
        subject: ""
      }));
    } else if (name === "subject") {
      setIsCustomSubject(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const classData = {
        subject: formData.subject,
        monthlyFee: Number(formData.monthlyFee),
        description: formData.description,
        teacherId: userInfo._id,
        difficulty: formData.difficulty,
        format: formData.format,
        maxStudents: Number(formData.maxStudents),
        schedule: formData.schedule
      };

      await axios.post(
        "http://localhost:5000/api/teacher/classes",
        classData,
        config
      );

      setSuccess(true);

      // Navigate after a brief delay to show success message
      setTimeout(() => {
        navigate("/teacher/dashboard");
      }, 1500);

    } catch (error) {
      setError(error.response?.data?.message || "Error creating class");
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel? Any unsaved changes will be lost.")) {
      navigate("/teacher/dashboard");
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
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
          <SchoolIcon fontSize="large" />
          <Box>
            <Typography variant="h5" component="h1" fontWeight="bold">
              Create New Class
            </Typography>
            <Typography variant="body2">
              Fill in the details to create a new class for your students
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
          >
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        )}

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Main Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="medium" color="text.secondary" gutterBottom>
                Class Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>

            {/* Subject Selection */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="subject-select-label">Subject *</InputLabel>
                <Select
                  labelId="subject-select-label"
                  id="subject"
                  name="subject"
                  value={isCustomSubject ? "Other" : formData.subject}
                  onChange={handleChange}
                  label="Subject *"
                  required
                  startAdornment={
                    <InputAdornment position="start">
                      <SchoolIcon fontSize="small" color="action" />
                    </InputAdornment>
                  }
                >
                  {SUBJECTS.map(subject => (
                    <MenuItem key={subject} value={subject}>
                      {subject}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Custom Subject Field */}
            {isCustomSubject && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="subject"
                  label="Custom Subject Name *"
                  value={formData.subject}
                  onChange={handleChange}
                  variant="outlined"
                  required
                  placeholder="Enter your custom subject"
                />
              </Grid>
            )}

            {/* Monthly Fee */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                name="monthlyFee"
                label="Monthly Fee *"
                value={formData.monthlyFee}
                onChange={handleChange}
                variant="outlined"
                required
                placeholder="0.00"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MoneyIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Class Format */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Class Format</InputLabel>
                <Select
                  name="format"
                  value={formData.format}
                  onChange={handleChange}
                  label="Class Format"
                >
                  <MenuItem value="In-Person">In-Person</MenuItem>
                  <MenuItem value="Online">Online</MenuItem>
                  <MenuItem value="Hybrid">Hybrid</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Max Students */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                name="maxStudents"
                label="Maximum Students"
                value={formData.maxStudents}
                onChange={handleChange}
                variant="outlined"
                placeholder="15"
              />
            </Grid>

            {/* Difficulty Level */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Difficulty Level</InputLabel>
                <Select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  label="Difficulty Level"
                >
                  <MenuItem value="Beginner">Beginner</MenuItem>
                  <MenuItem value="Intermediate">Intermediate</MenuItem>
                  <MenuItem value="Advanced">Advanced</MenuItem>
                  <MenuItem value="All Levels">All Levels</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Schedule */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="schedule"
                label="Class Schedule"
                value={formData.schedule}
                onChange={handleChange}
                variant="outlined"
                placeholder="E.g., Every Monday and Wednesday from 4:00 PM to 5:30 PM"
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                name="description"
                label="Class Description"
                value={formData.description}
                onChange={handleChange}
                variant="outlined"
                placeholder="Provide a detailed description of your class, including topics covered, learning outcomes, and any other important information for students."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                      <DescriptionIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Form Controls */}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<ArrowBackIcon />}
                onClick={handleCancel}
                sx={{ borderRadius: 1 }}
              >
                Cancel
              </Button>

              <Box>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  disabled={loading}
                  sx={{
                    ml: 2,
                    borderRadius: 1,
                    bgcolor: "#4f46e5",
                    '&:hover': {
                      bgcolor: "#4338ca"
                    }
                  }}
                >
                  {loading ? "Creating..." : "Create Class"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Preview Section */}
        <Box sx={{ p: 3, bgcolor: '#f9fafb', borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" fontWeight="bold" color="text.secondary" gutterBottom>
            Preview
          </Typography>

          <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                {formData.subject || "Subject Name"}
              </Typography>

              <Chip
                label={formData.difficulty}
                size="small"
                color={
                  formData.difficulty === "Beginner" ? "success" :
                  formData.difficulty === "Intermediate" ? "primary" :
                  formData.difficulty === "Advanced" ? "error" : "default"
                }
              />
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Chip
                label={`$${formData.monthlyFee || "0"}/month`}
                size="small"
                variant="outlined"
                icon={<MoneyIcon fontSize="small" />}
              />
              <Chip
                label={formData.format}
                size="small"
                variant="outlined"
              />
              <Chip
                label={`Max ${formData.maxStudents} students`}
                size="small"
                variant="outlined"
              />
            </Box>

            <Typography variant="body2" color="text.secondary">
              {formData.description || "Class description will appear here..."}
            </Typography>

            {formData.schedule && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  <strong>Schedule:</strong> {formData.schedule}
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      </Paper>

      {/* Success Message */}
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          sx={{ width: '100%' }}
          variant="filled"
        >
          Class created successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CreateClass;
