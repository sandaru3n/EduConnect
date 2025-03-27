import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, TextField, Button, List, ListItem, ListItemText, IconButton, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const ManageFAQs = () => {
  const [faqs, setFaqs] = useState([]);
  const [newFAQ, setNewFAQ] = useState({ question: '', answer: '' });
  const [editFAQ, setEditFAQ] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState(null);
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/faqs', config);
      setFaqs(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch FAQs');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.post('http://localhost:5000/api/faqs', newFAQ, config);
      setFaqs([data.faq, ...faqs]);
      setNewFAQ({ question: '', answer: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create FAQ');
    }
  };

  const handleEditOpen = (faq) => {
    setEditFAQ(faq);
    setDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditFAQ(null);
    setDialogOpen(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.put(`http://localhost:5000/api/faqs/${editFAQ._id}`, editFAQ, config);
      setFaqs(faqs.map(f => f._id === editFAQ._id ? data.faq : f));
      handleEditClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update FAQ');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.delete(`http://localhost:5000/api/faqs/${id}`, config);
        setFaqs(faqs.filter(f => f._id !== id));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete FAQ');
      }
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>Manage FAQs</Typography>
      {error && <Typography color="error">{error}</Typography>}

      {/* Create FAQ Form */}
      <form onSubmit={handleCreate} style={{ marginBottom: '2rem' }}>
        <TextField
          fullWidth
          label="Question"
          value={newFAQ.question}
          onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Answer"
          value={newFAQ.answer}
          onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
          margin="normal"
          multiline
          rows={3}
          required
        />
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Add FAQ
        </Button>
      </form>

      {/* FAQ List */}
      <List>
        {faqs.map((faq) => (
          <ListItem
            key={faq._id}
            secondaryAction={
              <>
                <IconButton edge="end" aria-label="edit" onClick={() => handleEditOpen(faq)}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(faq._id)}>
                  <DeleteIcon />
                </IconButton>
              </>
            }
          >
            <ListItemText primary={`Q: ${faq.question}`} secondary={`A: ${faq.answer}`} />
          </ListItem>
        ))}
      </List>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit FAQ</DialogTitle>
        <DialogContent>
          {editFAQ && (
            <form onSubmit={handleEditSubmit}>
              <TextField
                fullWidth
                label="Question"
                value={editFAQ.question}
                onChange={(e) => setEditFAQ({ ...editFAQ, question: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Answer"
                value={editFAQ.answer}
                onChange={(e) => setEditFAQ({ ...editFAQ, answer: e.target.value })}
                margin="normal"
                multiline
                rows={3}
                required
              />
            </form>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageFAQs;