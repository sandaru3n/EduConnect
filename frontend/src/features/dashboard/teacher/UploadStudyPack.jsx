// frontend/src/features/teacher/UploadStudyPack.jsx
import { useState } from 'react';
import axios from 'axios';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';

const UploadStudyPack = () => {
  const [formData, setFormData] = useState({ title: '', subject: '', price: '' });
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.name === 'coverPhoto') {
      setCoverPhoto(e.target.files[0]);
    } else {
      setFiles([...e.target.files]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('subject', formData.subject);
    data.append('price', formData.price);
    data.append('coverPhoto', coverPhoto);
    files.forEach(file => data.append('files', file));

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}`, 'Content-Type': 'multipart/form-data' } };
      await axios.post('http://localhost:5000/api/studypacks/upload', data, config);
      setSuccess('Study pack uploaded successfully!');
      setFormData({ title: '', subject: '', price: '' });
      setCoverPhoto(null);
      setFiles([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>Upload Study Pack</Typography>
      {error && <Alert severity="error">{error}</Alert>}
      {success && <Alert severity="success">{success}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField fullWidth label="Title" name="title" value={formData.title} onChange={handleChange} margin="normal" required />
        <TextField fullWidth label="Subject" name="subject" value={formData.subject} onChange={handleChange} margin="normal" required />
        <TextField fullWidth label="Price" name="price" type="number" value={formData.price} onChange={handleChange} margin="normal" required />
        <input type="file" name="coverPhoto" accept="image/*" onChange={handleFileChange} required />
        <input type="file" name="files" multiple accept=".pdf,video/*" onChange={handleFileChange} required />
        <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>Upload</Button>
      </form>
    </Box>
  );
};

export default UploadStudyPack;