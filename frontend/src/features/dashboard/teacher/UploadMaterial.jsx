import { useState, useEffect } from "react";
import { Breadcrumbs, Link as MuiLink, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import StudentSidebar from "../../../components/TeacherSidebar/index";
import StudentHeader from "../../../components/TeacherHeader/index";
import axios from "axios";
import { Box, TextField, Button, Select, MenuItem, FormControl, InputLabel, Alert, Grid } from "@mui/material";
import { InsertDriveFile, VideoLibrary, Link as LinkIcon, CalendarToday, ClassOutlined } from "@mui/icons-material";

const UploadMaterial = ({ classId }) => {
    const location = useLocation();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
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

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
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

    // Get the current page name for the tab title
    const pageTitle = pathnames.length > 0
        ? pathnames[pathnames.length - 1].charAt(0).toUpperCase() + pathnames[pathnames.length - 1].slice(1).replace(/-/g, ' ')
        : "Upload Material";

    // Update document title when location changes
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
                          <MuiLink component={Link} to="/teacher/classes/uploadmaterials" className="hover:text-blue-600">
                              Dashboard
                          </MuiLink>
                          {breadcrumbItems}
                      </Breadcrumbs>
                  </div>

                  {/* Form Container */}
                  <div className="mt-[104px] p-4 md:p-6 overflow-y-auto h-[calc(100vh-104px)]">
                      <Box sx={{ 
                          maxWidth: 800, 
                          mx: "auto", 
                          p: 4,
                          bgcolor: 'background.paper',
                          borderRadius: 4,
                          boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
                      }}>
                          <Typography variant="h4" gutterBottom sx={{ 
                              mb: 4, 
                              color: 'text.primary',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5
                          }}>
                              
                              Upload Class Material
                          </Typography>

                          {(error || success) && (
                              <Alert severity={error ? 'error' : 'success'} sx={{ mb: 3 }}>
                                  {error || success}
                              </Alert>
                          )}

                          <form onSubmit={handleSubmit}>
                              <Grid container spacing={3}>
                                  <Grid item xs={12} md={6}>
                                      <FormControl fullWidth variant="outlined">
                                          <InputLabel>Select Class</InputLabel>
                                          <Select
                                              value={selectedClass}
                                              onChange={(e) => setSelectedClass(e.target.value)}
                                              required
                                              startAdornment={<ClassOutlined sx={{ color: 'action.active', mr: 1 }} />}
                                          >
                                              <MenuItem value="">Select Class</MenuItem>
                                              {classes.map(cls => (
                                                  <MenuItem key={cls._id} value={cls._id}>
                                                      {cls.subject}
                                                  </MenuItem>
                                              ))}
                                          </Select>
                                      </FormControl>
                                  </Grid>

                                  <Grid item xs={12} md={6}>
                                      <TextField
                                          fullWidth
                                          label="Lesson Name"
                                          value={lessonName}
                                          onChange={(e) => setLessonName(e.target.value)}
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
                                          value={title}
                                          onChange={(e) => setTitle(e.target.value)}
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
                                              value={type}
                                              onChange={(e) => setType(e.target.value)}
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
                                          value={uploadDate}
                                          onChange={(e) => setUploadDate(e.target.value)}
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
                                      {type === "link" ? (
                                          <TextField
                                              fullWidth
                                              label="Content URL"
                                              value={content}
                                              onChange={(e) => setContent(e.target.value)}
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
                                                  Upload {type === 'pdf' ? 'PDF' : 'MP4'}
                                                  <input
                                                      type="file"
                                                      hidden
                                                      accept={type === "pdf" ? ".pdf" : ".mp4"}
                                                      onChange={(e) => setFile(e.target.files[0])}
                                                      required
                                                  />
                                              </Button>
                                              {file && (
                                                  <Typography variant="body2" color="textSecondary">
                                                      Selected: {file.name}
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
                                          Upload Material
                                      </Button>
                                  </Grid>
                              </Grid>
                          </form>
                      </Box>
                  </div>
              </div>
          </div>
      </div>
  );
};

export default UploadMaterial;