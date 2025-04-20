// frontend/src/features/dashboard/teacher/UploadMaterial.jsx
import { useState, useEffect } from "react";
import { Breadcrumbs, Link as MuiLink, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import StudentSidebar from "../../../components/TeacherSidebar/index";
import StudentHeader from "../../../components/TeacherHeader/index";

import axios from "axios";
import { Box, TextField, Button, Select, MenuItem, FormControl, InputLabel, Alert } from "@mui/material";

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
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

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
            <MuiLink component={Link} to="/student" underline="hover" color="inherit">
              Student
            </MuiLink>
            {breadcrumbItems}
          </Breadcrumbs>

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
          
        
          
          
          </div>
          </div> 
          
          </div>
          </div>
    </div>
  );
};

export default UploadMaterial;