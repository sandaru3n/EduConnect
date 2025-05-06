import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button, 
  Breadcrumbs, 
  Link as MuiLink,
  CircularProgress,
  Alert,
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  TablePagination, 
  IconButton, 
  Modal, 
  Fade, 
  Snackbar, 
  Collapse, 
  IconButton as MuiIconButton,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import CategoryIcon from '@mui/icons-material/Category';
import AdminSidebar from "../../../components/AdminSidebar/index";
import AdminHeader from "../../../components/AdminHeader/index";
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const BASE_URL = 'http://localhost:5000';

const EBookUpload = () => {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    author: '',
    status: 'active',
    document: null,
    coverPhoto: null,
    eBookId: null
  });
  const [eBooks, setEBooks] = useState([]);
  const [filteredEBooks, setFilteredEBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(8);
  const [successMessage, setSuccessMessage] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eBookToDelete, setEBookToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterOpen, setFilterOpen] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      const mobileView = window.innerWidth <= 768;
      setIsMobile(mobileView);
      setIsSidebarCollapsed(mobileView);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchEBooks();
  }, []);

  useEffect(() => {
    if (formData.coverPhoto && typeof formData.coverPhoto !== 'string') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(formData.coverPhoto);
    } else {
      setPreviewUrl(formData.coverPhoto || '');
    }
  }, [formData.coverPhoto]);

  useEffect(() => {
    const filtered = eBooks.filter((eBook) => {
      const matchesSearch =
        eBook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eBook.author.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = filterCategory === '' || eBook.category === filterCategory;
      const matchesStatus = filterStatus === '' || eBook.status === filterStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
    setFilteredEBooks(filtered);
    setPage(0); // Reset page to 0 when filters change
  }, [eBooks, searchTerm, filterCategory, filterStatus]);

  const fetchEBooks = async () => {
    setLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
      const response = await axios.get(`${BASE_URL}/api/ebooks`, config);
      setEBooks(response.data);

      const uniqueCategories = [...new Set(response.data.map(book => book.category))];
      setCategories(uniqueCategories);

      setError('');
    } catch (error) {
      console.error('Error fetching eBooks:', error);
      setError('Failed to load eBooks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: '',
      author: '',
      status: 'active',
      document: null,
      coverPhoto: null,
      eBookId: null
    });
    setPreviewUrl('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key]) data.append(key, formData[key]);
    });

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo?.token}`
        }
      };

      if (formData.eBookId) {
        const response = await axios.put(`${BASE_URL}/api/ebooks/edit/${formData.eBookId}`, data, config);
        setSuccessMessage(true);
        setError({ type: 'success', message: 'eBook updated successfully!' });
      } else {
        const response = await axios.post(`${BASE_URL}/api/ebooks/upload`, data, config);
        setSuccessMessage(true);
        setError({ type: 'success', message: 'eBook uploaded successfully!' });
      }
      resetForm();
      fetchEBooks();
    } catch (error) {
      console.error('Upload/Edit error:', error);
      setError({ type: 'error', message: error.response?.data?.message || error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (eBook) => {
    setFormData({
      title: eBook.title,
      category: eBook.category,
      author: eBook.author,
      status: eBook.status,
      document: null,
      coverPhoto: eBook.coverPhotoUrl,
      eBookId: eBook._id
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
      await axios.delete(`${BASE_URL}/api/ebooks/delete/${eBookToDelete}`, config);
      setError({ type: 'success', message: 'eBook deleted successfully' });
      fetchEBooks();
      setDeleteModalOpen(false);
      setEBookToDelete(null);
    } catch (error) {
      console.error('Delete error:', error);
      setError({ type: 'error', message: error.response?.data?.message || error.message });
      setDeleteModalOpen(false);
      setEBookToDelete(null);
    }
  };

  const openDeleteModal = (eBookId) => {
    setEBookToDelete(eBookId);
    setDeleteModalOpen(true);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const exportToCSV = () => {
    const headers = ['Title', 'Author', 'Category', 'Status', 'Downloads', 'Created At'];
    const rows = filteredEBooks.map(eBook => [
      `"${eBook.title}"`,
      `"${eBook.author}"`,
      `"${eBook.category}"`,
      eBook.status.charAt(0).toUpperCase() + eBook.status.slice(1),
      eBook.downloadCount || 0,
      new Date(eBook.uploadDate).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'ebooks_list.csv';
    link.click();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('eBooks List', 14, 22);
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    const tableColumn = ['Title', 'Author', 'Category', 'Status', 'Downloads', 'Created At'];
    const tableRows = filteredEBooks.map(eBook => [
      eBook.title,
      eBook.author,
      eBook.category,
      eBook.status.charAt(0).toUpperCase() + eBook.status.slice(1),
      eBook.downloadCount || 0,
      new Date(eBook.uploadDate).toLocaleDateString()
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 30 },
        2: { cellWidth: 30 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 30 },
      },
    });

    doc.save('ebooks_list.pdf');
  };

  // Calculate metrics for dashboard cards
  const totalEBooks = eBooks.length;
  const totalDownloads = eBooks.reduce((sum, eBook) => sum + (eBook.downloadCount || 0), 0);
  const totalCategories = categories.length;

  const pathnames = location.pathname.split("/").filter((x) => x);
  const breadcrumbItems = pathnames.map((value, index) => {
    const last = index === pathnames.length - 1;
    const to = `/${pathnames.slice(0, index + 1).join("/")}`;
    const displayName = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');

    return last ? (
      <Typography key={to} className="font-semibold text-gray-900">
        {displayName}
      </Typography>
    ) : (
      <MuiLink
        key={to}
        component={Link}
        to={to}
        className="hover:text-blue-600"
      >
        {displayName}
      </MuiLink>
    );
  });

  const pageTitle = pathnames.length > 0 
    ? pathnames[pathnames.length - 1].charAt(0).toUpperCase() + pathnames[pathnames.length - 1].slice(1)
    : "Dashboard";

  useEffect(() => {
    document.title = `${pageTitle} - Admin Dashboard - EduConnect`;
  }, [location, pageTitle]);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f3f4f6' }}>
      <CircularProgress sx={{ color: '#4f46e5' }} size={50} thickness={5} />
    </Box>
  );

  if (error && error.type === 'error') return (
    <Box sx={{ maxWidth: 960, mx: 'auto', p: 4 }}>
      <Alert severity="error" sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', bgcolor: '#fee2e2' }}>
        {error.message}
      </Alert>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: '#f3f4f6', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
      <AdminHeader 
        isSidebarCollapsed={isSidebarCollapsed}
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobile={isMobile}
        sx={{ position: 'sticky', top: 0, zIndex: 50, bgcolor: '#ffffff', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', borderBottom: '1px solid #e5e7eb' }}
      />
      
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100%',
            zIndex: 50,
            transition: 'all 0.3s ease',
            width: isSidebarCollapsed ? '60px' : { xs: '18%', md: '250px' },
            bgcolor: '#ffffff',
            borderRight: '1px solid #e5e7eb'
          }}
        >
          <AdminSidebar 
            isCollapsed={isSidebarCollapsed} 
            toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
          />
        </Box>

        <Box
          component="main"
          sx={{
            flex: 1,
            transition: 'all 0.3s ease',
            ml: isSidebarCollapsed ? '60px' : { xs: '18%', md: '250px' },
            p: { xs: 2, md: 4 },
            mt: { xs: 8, md: 10 }
          }}
        >
          <div className={`py-3 px-4 md:px-6 fixed top-[64px] right-2 z-30 transition-all duration-300 ${
            isSidebarCollapsed ? "ml-[60px] w-[calc(100%-60px)]" : "ml-[18%] w-[calc(100%-18%)] md:ml-[250px] md:w-[calc(100%-250px)]"
          } bg-white border-b border-gray-200 shadow-sm`}>
            <Breadcrumbs aria-label="breadcrumb" separator="›" className="text-gray-600">
              <MuiLink component={Link} to="/admin/dashboard" className="hover:text-blue-600">
                Dashboard
              </MuiLink>
              {breadcrumbItems}
            </Breadcrumbs>
          </div>

          <Box sx={{ maxWidth: 1200, mx: 'auto', mt: '40px' }}>
            <Typography variant="h4" sx={{ fontSize: { xs: '1.875rem', md: '2.25rem' }, fontWeight: 700, color: '#111827', mb: 2 }}>
              {formData.eBookId ? 'Update eBook' : 'Library Management'}
            </Typography>
            <Typography sx={{ color: '#6b7280', mb: 4 }}>
              {formData.eBookId
                ? 'Update information for the selected eBook'
                : 'Upload new eBooks to the library collection'}
            </Typography>

            {/* Dashboard Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={4}>
                <Card sx={{ bgcolor: '#ffffff', borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LibraryBooksIcon sx={{ fontSize: 40, color: '#4f46e5' }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
                        Total eBooks
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>
                        {totalEBooks}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ bgcolor: '#ffffff', borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <DownloadForOfflineIcon sx={{ fontSize: 40, color: '#16a34a' }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
                        Total Downloads
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>
                        {totalDownloads}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Card sx={{ bgcolor: '#ffffff', borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CategoryIcon sx={{ fontSize: 40, color: '#f59e0b' }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
                        Total Categories
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827' }}>
                        {totalCategories}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Alert Message */}
            {error && (
              <Alert
                severity={error.type === 'success' ? 'success' : 'error'}
                sx={{
                  mb: 4,
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  bgcolor: error.type === 'success' ? '#d1fae5' : '#fee2e2',
                  color: error.type === 'success' ? '#065f46' : '#dc2626'
                }}
                onClose={() => setError('')}
              >
                {error.message}
              </Alert>
            )}

            {/* Floating Success Message */}
            <Snackbar
              open={successMessage}
              autoHideDuration={3000}
              onClose={() => setSuccessMessage(false)}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <Alert
                severity="success"
                sx={{
                  bgcolor: '#10b981',
                  color: '#ffffff',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  '& .MuiAlert-icon': {
                    color: '#ffffff'
                  }
                }}
              >
                {formData.eBookId ? 'eBook updated successfully!' : 'eBook added successfully!'}
              </Alert>
            </Snackbar>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 6 }}>
              {/* Form Section */}
              <Box sx={{ flex: 1, maxWidth: { lg: '40%' } }}>
                <Paper sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                  <Box sx={{ bgcolor: '#4f46e5', p: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#ffffff' }}>
                      {formData.eBookId ? 'Update eBook Information' : 'Upload New eBook'}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 4 }}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#111827', mb: 1 }}>
                          Book Title <span className="text-red-500">*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          variant="outlined"
                          size="small"
                          placeholder="Enter book title"
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': { borderColor: '#3b82f6' },
                              '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                            },
                          }}
                        />
                      </Box>

                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#111827', mb: 1 }}>
                          Author <span className="text-red-500">*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          id="author"
                          name="author"
                          value={formData.author}
                          onChange={handleChange}
                          variant="outlined"
                          size="small"
                          placeholder="Author name"
                          required
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': { borderColor: '#3b82f6' },
                              '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                            },
                          }}
                        />
                      </Box>

                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#111827', mb: 1 }}>
                          Category <span className="text-red-500">*</span>
                        </Typography>
                        <TextField
                          fullWidth
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          variant="outlined"
                          size="small"
                          placeholder="e.g. Fiction, Science, History"
                          required
                          InputProps={{
                            list: 'category-suggestions'
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&:hover fieldset': { borderColor: '#3b82f6' },
                              '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                            },
                          }}
                        />
                        <datalist id="category-suggestions">
                          {categories.map((category) => (
                            <option key={category} value={category} />
                          ))}
                        </datalist>
                      </Box>

                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#111827', mb: 1 }}>
                          Status
                        </Typography>
                        <FormControl fullWidth size="small">
                          <Select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            sx={{
                              borderRadius: 2,
                              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
                            }}
                          >
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="inactive">Inactive</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>

                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#111827', mb: 1 }}>
                          Document (PDF) {!formData.eBookId && <span className="text-red-500">*</span>}
                        </Typography>
                        <Box sx={{ border: '2px dashed #d1d5db', borderRadius: 2, p: 4, textAlign: 'center', bgcolor: '#f9fafb', '&:hover': { bgcolor: '#f3f4f6' } }}>
                          <input
                            type="file"
                            id="document"
                            name="document"
                            onChange={handleChange}
                            accept=".pdf"
                            disabled={formData.eBookId}
                            className="hidden"
                            required={!formData.eBookId}
                          />
                          <label htmlFor="document" className={`block ${formData.eBookId ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                            <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <Typography variant="body2" sx={{ color: '#6b7280', mt: 1 }}>
                              {formData.document ? formData.document.name : formData.eBookId ? 'PDF already uploaded' : 'Click to upload PDF'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                              PDF up to 50MB
                            </Typography>
                          </label>
                        </Box>
                      </Box>

                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#111827', mb: 1 }}>
                          Cover Photo
                        </Typography>
                        <Box sx={{ border: previewUrl ? '1px solid #d1d5db' : '2px dashed #d1d5db', borderRadius: 2, p: previewUrl ? 1 : 4, textAlign: 'center', bgcolor: '#f9fafb', '&:hover': { bgcolor: '#f3f4f6' }, height: 160 }}>
                          <input
                            type="file"
                            id="coverPhoto"
                            name="coverPhoto"
                            onChange={handleChange}
                            accept=".jpg,.jpeg,.png"
                            className="hidden"
                          />
                          <label htmlFor="coverPhoto" className="block cursor-pointer h-full">
                            {previewUrl ? (
                              <Box sx={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: 1 }}>
                                <img src={previewUrl} alt="Cover preview" className="w-full h-full object-cover" />
                              </Box>
                            ) : (
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <Typography variant="body2" sx={{ color: '#6b7280', mt: 1 }}>
                                  Click to upload cover image
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                                  JPG, PNG up to 5MB
                                </Typography>
                              </Box>
                            )}
                          </label>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2, borderTop: '1px solid #e5e7eb' }}>
                        <Button
                          variant="outlined"
                          onClick={resetForm}
                          sx={{ textTransform: 'none', borderRadius: 1 }}
                        >
                          {formData.eBookId ? 'Cancel' : 'Reset'}
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={isSubmitting}
                          sx={{
                            textTransform: 'none',
                            borderRadius: 1,
                            bgcolor: '#4f46e5',
                            '&:hover': { bgcolor: '#4338ca' },
                            '&:disabled': { bgcolor: '#a5b4fc', cursor: 'not-allowed' }
                          }}
                        >
                          {isSubmitting ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing...
                            </span>
                          ) : formData.eBookId ? 'Update eBook' : 'Upload eBook'}
                        </Button>
                      </Box>
                    </form>
                  </Box>
                </Paper>
              </Box>

              {/* List Section */}
              <Box sx={{ flex: 1, maxWidth: { lg: '80%' } }}>
                <Paper sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                  <Box sx={{ bgcolor: '#4f46e5', p: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#ffffff' }}>
                      eBook Library
                    </Typography>
                  </Box>
                  <Box sx={{ p: 3 }}>
                    {/* Filter and Export Section */}
                    <Box sx={{ mb: 3 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          bgcolor: '#ffffff',
                          borderRadius: 2,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          p: 2,
                          border: '1px solid #e5e7eb'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <FilterListIcon sx={{ color: '#4f46e5' }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#111827' }}>
                            Filters
                          </Typography>
                        </Box>
                        <MuiIconButton onClick={() => setFilterOpen(!filterOpen)}>
                          {filterOpen ? <ExpandLessIcon sx={{ color: '#4f46e5' }} /> : <ExpandMoreIcon sx={{ color: '#4f46e5' }} />}
                        </MuiIconButton>
                      </Box>
                      <Collapse in={filterOpen}>
                        <Box
                          sx={{
                            bgcolor: '#ffffff',
                            borderRadius: 2,
                            p: 2,
                            mt: 1,
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, alignItems: 'center' }}>
                            <TextField
                              variant="outlined"
                              size="small"
                              placeholder="Search by title or author..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              sx={{
                                flex: 1,
                                bgcolor: '#f9fafb',
                                borderRadius: 2,
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                  '&:hover fieldset': { borderColor: '#3b82f6' },
                                  '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                                },
                              }}
                            />
                            <FormControl sx={{ width: { xs: '100%', md: 200 } }} size="small">
                              <InputLabel sx={{ color: '#6b7280' }}>Category</InputLabel>
                              <Select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                                label="Category"
                                sx={{
                                  bgcolor: '#f9fafb',
                                  borderRadius: 2,
                                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
                                }}
                              >
                                <MenuItem value="">All Categories</MenuItem>
                                {categories.map((category) => (
                                  <MenuItem key={category} value={category}>{category}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            <FormControl sx={{ width: { xs: '100%', md: 150 } }} size="small">
                              <InputLabel sx={{ color: '#6b7280' }}>Status</InputLabel>
                              <Select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                label="Status"
                                sx={{
                                  bgcolor: '#f9fafb',
                                  borderRadius: 2,
                                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
                                }}
                              >
                                <MenuItem value="">All Statuses</MenuItem>
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="inactive">Inactive</MenuItem>
                              </Select>
                            </FormControl>
                          </Box>
                        </Box>
                      </Collapse>
                    </Box>

                    {/* Export Buttons */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={exportToCSV}
                        sx={{
                          textTransform: 'none',
                          bgcolor: '#4f46e5',
                          '&:hover': { bgcolor: '#4338ca' },
                          borderRadius: 1,
                          px: 2,
                          py: 0.5,
                          fontSize: '0.875rem'
                        }}
                      >
                        Export CSV
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<PictureAsPdfIcon />}
                        onClick={exportToPDF}
                        sx={{
                          textTransform: 'none',
                          bgcolor: '#4f46e5',
                          '&:hover': { bgcolor: '#4338ca' },
                          borderRadius: 1,
                          px: 2,
                          py: 0.5,
                          fontSize: '0.875rem'
                        }}
                      >
                        Export PDF
                      </Button>
                    </Box>

                    {loading ? (
                      <Box sx={{ textAlign: 'center', py: 8 }}>
                        <CircularProgress sx={{ color: '#4f46e5' }} size={40} thickness={5} />
                        <Typography sx={{ color: '#6b7280', mt: 2, fontSize: '0.875rem' }}>Loading eBooks...</Typography>
                      </Box>
                    ) : filteredEBooks.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 8 }}>
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <Typography variant="h6" sx={{ mt: 2, color: '#111827', fontSize: '1rem' }}>No eBooks found</Typography>
                        <Typography sx={{ mt: 1, color: '#6b7280', fontSize: '0.875rem' }}>
                          {searchTerm || filterCategory || filterStatus ? 'Try adjusting your search or filters.' : 'Start by uploading a new eBook.'}
                        </Typography>
                      </Box>
                    ) : (
                      <TableContainer>
                        <Table sx={{ '& .MuiTableCell-root': { py: 1, px: 2, fontSize: '0.875rem' } }}>
                          <TableHead>
                            <TableRow sx={{ bgcolor: '#f0f4f8' }}>
                              <TableCell sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>Cover</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>Title</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>Author</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>Category</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>Status</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>Downloads</TableCell>
                              <TableCell sx={{ fontWeight: 600, color: '#111827', fontSize: '0.875rem' }}>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {filteredEBooks
                              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                              .map((eBook) => (
                                <TableRow key={eBook._id} sx={{ '&:hover': { bgcolor: '#f9fafb' } }}>
                                  <TableCell>
                                    {eBook.coverPhotoUrl ? (
                                      <img
                                        src={eBook.coverPhotoUrl}
                                        alt={`${eBook.title} cover`}
                                        className="w-12 h-16 object-cover rounded"
                                        onError={(e) => {
                                          console.error(`Failed to load cover photo for ${eBook.title}: ${eBook.coverPhotoUrl}`);
                                          e.target.src = '';
                                        }}
                                      />
                                    ) : (
                                      <Box sx={{ width: 48, height: 64, bgcolor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 1 }}>
                                        <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                      </Box>
                                    )}
                                  </TableCell>
                                  <TableCell>{eBook.title}</TableCell>
                                  <TableCell>{eBook.author}</TableCell>
                                  <TableCell>{eBook.category}</TableCell>
                                  <TableCell sx={{ color: eBook.status === 'active' ? '#16a34a' : '#ef4444' }}>
                                    {eBook.status.charAt(0).toUpperCase() + eBook.status.slice(1)}
                                  </TableCell>
                                  <TableCell>{eBook.downloadCount || 0}</TableCell>
                                  <TableCell sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    {eBook.fileUrl && (
                                      <IconButton
                                        href={eBook.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{ 
                                          color: '#4f46e5',
                                          '&:hover': { 
                                            bgcolor: '#e0e7ff',
                                            color: '#4338ca'
                                          }
                                        }}
                                      >
                                        <PictureAsPdfIcon fontSize="small" />
                                      </IconButton>
                                    )}
                                    <IconButton
                                      onClick={() => handleEdit(eBook)}
                                      sx={{ 
                                        color: '#4f46e5',
                                        '&:hover': { 
                                          bgcolor: '#e0e7ff',
                                          color: '#4338ca'
                                        }
                                      }}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                      onClick={() => openDeleteModal(eBook._id)}
                                      sx={{ 
                                        color: '#ef4444',
                                        '&:hover': { 
                                          bgcolor: '#fee2e2',
                                          color: '#dc2626'
                                        }
                                      }}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                    <TablePagination
                      rowsPerPageOptions={[8]}
                      component="div"
                      count={filteredEBooks.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={handleChangePage}
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Paper>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        closeAfterTransition
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Fade in={deleteModalOpen}>
          <Box
            sx={{
              bgcolor: '#ffffff',
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              p: 4,
              width: '90%',
              maxWidth: 400,
              textAlign: 'center'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#111827', mb: 2 }}>
              Confirm Deletion
            </Typography>
            <Typography variant="body1" sx={{ color: '#6b7280', mb: 3 }}>
              Are you sure you want to delete this eBook? This action cannot be undone.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => setDeleteModalOpen(false)}
                sx={{ textTransform: 'none', borderRadius: 1 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleDelete}
                sx={{ textTransform: 'none', borderRadius: 1 }}
              >
                Delete
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default EBookUpload;