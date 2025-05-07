// frontend/src/features/teacher/UploadStudyPacks.jsx
import { useState, useEffect } from "react";
import { Breadcrumbs, Link as MuiLink, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import StudentSidebar from "../../../components/TeacherSidebar/index";
import StudentHeader from "../../../components/TeacherHeader/index";

import axios from 'axios';
import { Box, TextField, Button, Alert, Select, MenuItem, IconButton, FormControl, InputLabel } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

const UploadStudyPack = () => {

  const [formData, setFormData] = useState({ title: '', subject: '', price: '' });
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [filesData, setFilesData] = useState([{ lessonName: '', type: 'pdf', content: null }]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileDataChange = (index, field, value) => {
    const updatedFilesData = [...filesData];
    updatedFilesData[index][field] = value;
    setFilesData(updatedFilesData);
  };

  const handleFileChange = (index, e) => {
    const updatedFilesData = [...filesData];
    updatedFilesData[index].content = e.target.files[0];
    setFilesData(updatedFilesData);
  };

  const addFileField = () => {
    setFilesData([...filesData, { lessonName: '', type: 'pdf', content: null }]);
  };

  const removeFileField = (index) => {
    setFilesData(filesData.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('subject', formData.subject);
    data.append('price', formData.price);
    data.append('coverPhoto', coverPhoto);
    data.append('filesData', JSON.stringify(filesData.filter(file => file.lessonName && (file.type === 'url' ? file.content : true))));

    filesData.forEach((fileData, index) => {
      if (fileData.type !== 'url' && fileData.content) {
        data.append('files', fileData.content);
      }
    });

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}`, 'Content-Type': 'multipart/form-data' } };
      await axios.post('http://localhost:5000/api/studypacks/upload', data, config);
      setSuccess('Study pack uploaded successfully!');
      setFormData({ title: '', subject: '', price: '' });
      setCoverPhoto(null);
      setFilesData([{ lessonName: '', type: 'pdf', content: null }]);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
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
            {breadcrumbItems}
          </Breadcrumbs>
          </div></div>
        
          
          <div className="mt-[90px] p-4 md:p-6 overflow-y-auto h-[calc(100vh-90px)]">
          <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>Upload Study Pack</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField fullWidth label="Title" name="title" value={formData.title} onChange={handleChange} margin="normal" required />
        <TextField fullWidth label="Subject" name="subject" value={formData.subject} onChange={handleChange} margin="normal" required />
        <TextField fullWidth label="Price" name="price" type="number" value={formData.price} onChange={handleChange} margin="normal" required />
        <Typography variant="subtitle1" sx={{ mt: 2 }}>Cover Photo</Typography>
        <input type="file" name="coverPhoto" accept="image/*" onChange={(e) => setCoverPhoto(e.target.files[0])} required />

        <Typography variant="subtitle1" sx={{ mt: 2 }}>Files</Typography>
        {filesData.map((fileData, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TextField
              label="Lesson Name"
              value={fileData.lessonName}
              onChange={(e) => handleFileDataChange(index, 'lessonName', e.target.value)}
              sx={{ mr: 2, flex: 1 }}
              required
            />
            <FormControl sx={{ minWidth: 120, mr: 2 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={fileData.type}
                onChange={(e) => handleFileDataChange(index, 'type', e.target.value)}
                label="Type"
              >
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="video">Video</MenuItem>
                <MenuItem value="url">URL</MenuItem>
              </Select>
            </FormControl>
            {fileData.type === 'url' ? (
              <TextField
                label="URL"
                value={fileData.content || ''}
                onChange={(e) => handleFileDataChange(index, 'content', e.target.value)}
                sx={{ flex: 1 }}
                required
              />
            ) : (
              <input
                type="file"
                accept={fileData.type === 'pdf' ? '.pdf' : 'video/*'}
                onChange={(e) => handleFileChange(index, e)}
                required={!fileData.content}
              />
            )}
            <IconButton onClick={() => removeFileField(index)} color="error" sx={{ ml: 1 }}>
              <RemoveCircleIcon />
            </IconButton>
          </Box>
        ))}
        <Button startIcon={<AddCircleIcon />} onClick={addFileField} sx={{ mb: 2 }}>
          Add More Files
        </Button>
        <Button type="submit" variant="contained" color="primary" fullWidth>Upload</Button>
      </form>
    </Box>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadStudyPack;