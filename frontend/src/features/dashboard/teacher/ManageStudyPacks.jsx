import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, Card, CardContent, CardMedia, Button, Grid, CircularProgress, Alert,
  TextField, Select, MenuItem, FormControl, InputLabel, IconButton, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

const ManageStudyPacks = () => {
  const [studyPacks, setStudyPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState(null);
  const [formData, setFormData] = useState({ title: '', subject: '', price: '' });
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [filesData, setFilesData] = useState([]);

  const fetchTeacherStudyPacks = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/studypacks/teacher', config);
      setStudyPacks(data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch study packs');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherStudyPacks();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this study pack?')) {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.delete(`http://localhost:5000/api/studypacks/${id}`, config);
        setStudyPacks(studyPacks.filter(pack => pack._id !== id));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete study pack');
      }
    }
  };

  const handleEditOpen = (pack) => {
    setSelectedPack(pack);
    setFormData({ title: pack.title, subject: pack.subject, price: pack.price });
    setFilesData(pack.files.map(file => ({
      lessonName: file.lessonName,
      type: file.type,
      content: file.type === 'url' ? file.content : null,
    })));
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    setSelectedPack(null);
    setCoverPhoto(null);
    setFilesData([]);
  };

  const handleFormChange = (e) => {
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

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('subject', formData.subject);
    data.append('price', formData.price);
    if (coverPhoto) data.append('coverPhoto', coverPhoto);
    data.append('filesData', JSON.stringify(filesData.filter(file => file.lessonName)));

    filesData.forEach((fileData, index) => {
      if (fileData.type !== 'url' && fileData.content instanceof File) {
        data.append('files', fileData.content);
      }
    });

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}`, 'Content-Type': 'multipart/form-data' } };
      const { data: updatedPack } = await axios.put(`http://localhost:5000/api/studypacks/${selectedPack._id}`, data, config);
      setStudyPacks(studyPacks.map(pack => (pack._id === selectedPack._id ? updatedPack.studyPack : pack)));
      handleEditClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update study pack');
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>My Study Packs</Typography>
      <Grid container spacing={3}>
        {studyPacks.map(pack => (
          <Grid item xs={12} sm={6} md={4} key={pack._id}>
            <Card>
              <CardMedia component="img" height="140" image={pack.coverPhotoUrl} alt={pack.title} />
              <CardContent>
                <Typography variant="h6">{pack.title}</Typography>
                <Typography variant="body2" color="textSecondary">Subject: {pack.subject}</Typography>
                <Typography variant="body2">Price: ${pack.price}</Typography>
                <Typography variant="body2">Status: {pack.status}</Typography>
                <Typography variant="subtitle1" sx={{ mt: 1 }}>Files:</Typography>
                {pack.files.map((file, index) => (
                  <Typography key={index} variant="body2">
                    {file.lessonName} ({file.type})
                  </Typography>
                ))}
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<EditIcon />}
                    onClick={() => handleEditOpen(pack)}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDelete(pack._id)}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={handleEditClose} maxWidth="md" fullWidth>
        <DialogTitle>Edit Study Pack</DialogTitle>
        <DialogContent>
          <form onSubmit={handleEditSubmit}>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleFormChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Subject"
              name="subject"
              value={formData.subject}
              onChange={handleFormChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleFormChange}
              margin="normal"
              required
            />
            <Typography variant="subtitle1" sx={{ mt: 2 }}>Cover Photo (optional)</Typography>
            <input
              type="file"
              name="coverPhoto"
              accept="image/*"
              onChange={(e) => setCoverPhoto(e.target.files[0])}
            />
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
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary" onClick={handleEditSubmit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageStudyPacks;