//frontend/src/features/dashboard/admin/ManageFAQs.jsx
import { useState, useEffect } from "react";
import { Breadcrumbs, Link as MuiLink, Typography, Box, IconButton, Button } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import AdminSidebar from "../../../components/AdminSidebar/index";
import AdminHeader from "../../../components/AdminHeader/index";
import axios from 'axios';
import {  TextField, List, ListItem, ListItemText,Dialog, DialogTitle, DialogContent, DialogActions
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

  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);

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

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const pathnames = location.pathname.split("/").filter((x) => x);
  const breadcrumbItems = pathnames.map((value, index) => {
    const last = index === pathnames.length - 1;
    const to = `/${pathnames.slice(0, index + 1).join("/")}`;
    const displayName = value.charAt(0).toUpperCase() + value.slice(1);

    return last ? (
      <Typography key={to} color="text.primary" fontWeight="medium">
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
    document.title = `${pageTitle} - Admin Panel`;
  }, [location, pageTitle]);

  // Get avatar background color based on name
  const getAvatarColor = (name) => {
    const colors = [
      '#4f46e5', '#0ea5e9', '#10b981', '#f59e0b',
      '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'
    ];

    const firstChar = name.charAt(0).toLowerCase();
    const charCode = firstChar.charCodeAt(0) - 97; // 'a' is 97 in ASCII
    const colorIndex = Math.abs(charCode) % colors.length;

    return colors[colorIndex];
  };

  
  return (
    <div className="bg-gray-50 min-h-screen">
      <AdminHeader
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
          <AdminSidebar
            isCollapsed={isSidebarCollapsed}
            toggleSidebar={toggleSidebar}
          />
        </div>

        <div
          className={`flex-1 transition-all duration-300 ${
            isSidebarCollapsed ? "ml-[60px]" : "ml-[18%] md:ml-[250px]"
          }`}
        >
          {/* Breadcrumbs */}
          <div
            className={`mt-[50px] py-3 px-6 bg-white border-b shadow-sm transition-all duration-300 z-30 fixed top-0 left-0 w-full ${
              isSidebarCollapsed
                ? "ml-[60px] w-[calc(100%-60px)]"
                : "ml-[18%] w-[calc(100%-18%)] md:ml-[250px] md:w-[calc(100%-250px)]"
            }`}
          >
            <Breadcrumbs aria-label="breadcrumb">
              {breadcrumbItems}
            </Breadcrumbs>
          </div>

          <div className="mt-[100px] p-6 md:p-8 overflow-y-auto h-[calc(100vh-100px)]">
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
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageFAQs;