// frontend/src/features/teacher/UploadStudyPacks.jsx
import { useState } from 'react';
import axios from 'axios';
import { Box, TextField, Button, Typography, Alert, Select, MenuItem, IconButton, FormControl, InputLabel } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

const UploadStudyPack = () => {
  const [formData, setFormData] = useState({ title: '', subject: '', price: '' });
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [filesData, setFilesData] = useState([{ lessonName: '', type: 'pdf', content: null }]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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

  return (
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
  );
};

export default UploadStudyPack;