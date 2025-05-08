//frontend/src/features/dashboard/admin/ManageKnowledgebase.jsx
import { useState, useEffect } from "react";
import { Breadcrumbs, Link as MuiLink, Typography, Box, IconButton, Button} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import AdminSidebar from "../../../components/AdminSidebar/index";
import AdminHeader from "../../../components/AdminHeader/index";
import axios from 'axios';
import {
  
  
  TextField,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';




const ManageKnowledgebase = () => {
  const [articles, setArticles] = useState([]);
  const [newArticle, setNewArticle] = useState({ title: '', content: '', category: '' });
  const [editArticle, setEditArticle] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState(null);
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);

  const categories = [
    'Set Up Your Account',
    'Work With Your Team',
    'Explore Proactive Messages',
    'Self Service Best Practices',
  ];

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/knowledgebase', config);
      setArticles(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch articles');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.post('http://localhost:5000/api/knowledgebase', newArticle, config);
      setArticles([data.article, ...articles]);
      setNewArticle({ title: '', content: '', category: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create article');
    }
  };

  const handleEditOpen = (article) => {
    setEditArticle(article);
    setDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditArticle(null);
    setDialogOpen(false);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.put(`http://localhost:5000/api/knowledgebase/${editArticle._id}`, editArticle, config);
      setArticles(articles.map(a => a._id === editArticle._id ? data.article : a));
      handleEditClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update article');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.delete(`http://localhost:5000/api/knowledgebase/${id}`, config);
        setArticles(articles.filter(a => a._id !== id));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete article');
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
            {/* Page Header */}

            <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>Manage Knowledgebase</Typography>
      {error && <Typography color="error">{error}</Typography>}

      {/* Create Article Form */}
      <form onSubmit={handleCreate} style={{ marginBottom: '2rem' }}>
        <TextField
          fullWidth
          label="Title"
          value={newArticle.title}
          onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Content"
          value={newArticle.content}
          onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
          margin="normal"
          multiline
          rows={5}
          required
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Category</InputLabel>
          <Select
            value={newArticle.category}
            onChange={(e) => setNewArticle({ ...newArticle, category: e.target.value })}
            required
          >
            {categories.map((category, index) => (
              <MenuItem key={index} value={category}>{category}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
          Add Article
        </Button>
      </form>

      {/* Article List */}
      <List>
        {articles.map((article) => (
          <ListItem
            key={article._id}
            secondaryAction={
              <>
                <IconButton edge="end" aria-label="edit" onClick={() => handleEditOpen(article)}>
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(article._id)}>
                  <DeleteIcon />
                </IconButton>
              </>
            }
          >
            <ListItemText
              primary={article.title}
              secondary={`Category: ${article.category}`}
            />
          </ListItem>
        ))}
      </List>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Article</DialogTitle>
        <DialogContent>
          {editArticle && (
            <form onSubmit={handleEditSubmit}>
              <TextField
                fullWidth
                label="Title"
                value={editArticle.title}
                onChange={(e) => setEditArticle({ ...editArticle, title: e.target.value })}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Content"
                value={editArticle.content}
                onChange={(e) => setEditArticle({ ...editArticle, content: e.target.value })}
                margin="normal"
                multiline
                rows={5}
                required
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Category</InputLabel>
                <Select
                  value={editArticle.category}
                  onChange={(e) => setEditArticle({ ...editArticle, category: e.target.value })}
                  required
                >
                  {categories.map((category, index) => (
                    <MenuItem key={index} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
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

export default ManageKnowledgebase;