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
  Modal,
  TextField,
  Fade,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Collapse,
  Card,
  CardContent,
  TablePagination
} from '@mui/material';
import AdminSidebar from "../../../components/AdminSidebar/index";
import AdminHeader from "../../../components/AdminHeader/index";
import { FilterList as FilterListIcon, ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon } from '@mui/icons-material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const BASE_URL = 'http://localhost:5000';

const InstituteList = () => {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [institutes, setInstitutes] = useState([]);
  const [filteredInstitutes, setFilteredInstitutes] = useState([]); // Changed from filteredTeachers to filteredInstitutes
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [selectedInstituteId, setSelectedInstituteId] = useState(null);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [selectedInstitute, setSelectedInstitute] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    contactNumber: ''
  });
  const [editErrors, setEditErrors] = useState({});
  const [filter, setFilter] = useState({
    name: '',
    email: '',
    status: 'all'
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(8);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const toggleFilterPanel = () => setFilterPanelOpen(!filterPanelOpen);

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
    const fetchInstitutes = async () => { // Updated function name from fetchTeachers to fetchInstitutes
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
        const { data } = await axios.get(`${BASE_URL}/api/admin/institutes`, config);
        setInstitutes(data);
        setFilteredInstitutes(data); // Updated from setFilteredTeachers to setFilteredInstitutes
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch institutes. Please try again later.');
        setLoading(false);
      }
    };
    fetchInstitutes();
  }, []);

  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...institutes];

      if (filter.name) {
        filtered = filtered.filter(institute =>
          institute.name.toLowerCase().includes(filter.name.toLowerCase())
        );
      }

      if (filter.email) {
        filtered = filtered.filter(institute =>
          institute.email.toLowerCase().includes(filter.email.toLowerCase())
        );
      }

      if (filter.status !== 'all') {
        filtered = filtered.filter(institute => institute.subscriptionStatus === filter.status);
      }

      setFilteredInstitutes(filtered); // Updated from setFilteredTeachers to setFilteredInstitutes
      setPage(0); // Reset to first page when filters change
    };

    applyFilters();
  }, [filter, institutes]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  const handleBanInstitute = async (instituteId) => {
    setSelectedInstituteId(instituteId);
    setConfirmMessage('Are you sure you want to ban this institute?');
    setConfirmAction(() => async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
        await axios.put(`${BASE_URL}/api/admin/institutes/${instituteId}/ban`, {}, config);
        setInstitutes(institutes.map(institute =>
          institute._id === instituteId ? { ...institute, subscriptionStatus: 'inactive' } : institute
        ));
        setConfirmModalOpen(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to ban institute. Please try again later.');
        setConfirmModalOpen(false);
      }
    });
    setConfirmModalOpen(true);
  };

  const handleUnbanInstitute = async (instituteId) => {
    setSelectedInstituteId(instituteId);
    setConfirmMessage('Are you sure you want to unban this institute?');
    setConfirmAction(() => async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
        await axios.put(`${BASE_URL}/api/admin/institutes/${instituteId}/unban`, {}, config);
        setInstitutes(institutes.map(institute =>
          institute._id === instituteId ? { ...institute, subscriptionStatus: 'active' } : institute
        ));
        setConfirmModalOpen(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to unban institute. Please try again later.');
        setConfirmModalOpen(false);
      }
    });
    setConfirmModalOpen(true);
  };

  const handleRemoveInstitute = async (instituteId) => {
    setSelectedInstituteId(instituteId);
    setConfirmMessage('Are you sure you want to remove this institute? This action cannot be undone.');
    setConfirmAction(() => async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
        await axios.delete(`${BASE_URL}/api/admin/institutes/${instituteId}`, config);
        setInstitutes(institutes.filter(institute => institute._id !== instituteId));
        setConfirmModalOpen(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to remove institute. Please try again later.');
        setConfirmModalOpen(false);
      }
    });
    setConfirmModalOpen(true);
  };

  const handleOpenEditModal = (institute) => {
    setSelectedInstitute(institute);
    setEditFormData({
      name: institute.name,
      email: institute.email,
      contactNumber: institute.contactNumber || ''
    });
    setEditErrors({});
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedInstitute(null);
    setEditFormData({ name: '', email: '', contactNumber: '' });
    setEditErrors({});
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
    setEditErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateEditForm = () => {
    const errors = {};
    if (!editFormData.name) errors.name = 'Name is required';
    if (!editFormData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(editFormData.email)) errors.email = 'Email is invalid';
    if (editFormData.contactNumber && !/^\+?\d{10,15}$/.test(editFormData.contactNumber)) errors.contactNumber = 'Contact number must be 10-15 digits';
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!validateEditForm()) return;

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
      const response = await axios.put(
        `${BASE_URL}/api/admin/institutes/${selectedInstitute._id}`,
        editFormData,
        config
      );
      setInstitutes(institutes.map(institute =>
        institute._id === selectedInstitute._id ? response.data.institute : institute
      ));
      handleCloseEditModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update institute. Please try again later.');
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Contact Number', 'Status', 'Created At'];
    const rows = filteredInstitutes.map(institute => [
      `"${institute.name}"`,
      `"${institute.email}"`,
      institute.contactNumber || 'N/A',
      institute.subscriptionStatus,
      new Date(institute.createdAt).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'institutes_list.csv';
    link.click();
  };

  // Export to PDF using jsPDF and jspdf-autotable
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Set document properties
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Institutes List", 14, 20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Admin: ${JSON.parse(localStorage.getItem('userInfo'))?.name || 'EduConnect Admin'}`, 14, 40);

    // Prepare table data
    const tableData = filteredInstitutes.map(institute => [
      institute.name,
      institute.email,
      institute.contactNumber || 'N/A',
      institute.subscriptionStatus.charAt(0).toUpperCase() + institute.subscriptionStatus.slice(1),
      new Date(institute.createdAt).toLocaleDateString()
    ]);

    // Generate table using jspdf-autotable
    doc.autoTable({
      startY: 50,
      head: [['Name', 'Email', 'Contact Number', 'Status', 'Created At']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] }, // Blue header (RGB equivalent of #3b82f6)
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 40 }, // Name
        1: { cellWidth: 50 }, // Email
        2: { cellWidth: 30 }, // Contact Number
        3: { cellWidth: 20 }, // Status
        4: { cellWidth: 25 }, // Created At
      },
      margin: { top: 50 },
    });

    // Save the PDF
    doc.save(`Institutes_List_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

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

  if (error) return (
    <Box sx={{ maxWidth: 960, mx: 'auto', p: 4 }}>
      <Alert severity="error" sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', bgcolor: '#fee2e2' }}>
        {error}
      </Alert>
    </Box>
  );

  return (
    <Box sx={{ bgcolor: '#f3f4f6', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
      <AdminHeader 
        isSidebarCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
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
            toggleSidebar={toggleSidebar} 
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4" sx={{ fontSize: { xs: '1.875rem', md: '2.25rem' }, fontWeight: 700, color: '#111827' }}>
                All Institutes List
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={exportToCSV}
                  sx={{ textTransform: 'none', borderRadius: 1, bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}
                >
                  Export CSV
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={exportToPDF}
                  sx={{ textTransform: 'none', borderRadius: 1, bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}
                >
                  Export PDF
                </Button>
              </Box>
            </Box>
            <Card sx={{ mb: 4, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: '#fafafa', borderBottom: '1px solid #e5e7eb' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#111827' }}>
                  Filters
                </Typography>
                <IconButton onClick={toggleFilterPanel}>
                  {filterPanelOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
              <Collapse in={filterPanelOpen}>
                <CardContent sx={{ bgcolor: '#ffffff', p: 3 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Filter by Name"
                        name="name"
                        value={filter.name}
                        onChange={handleFilterChange}
                        variant="outlined"
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': { borderColor: '#3b82f6' },
                            '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        fullWidth
                        label="Filter by Email"
                        name="email"
                        value={filter.email}
                        onChange={handleFilterChange}
                        variant="outlined"
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': { borderColor: '#3b82f6' },
                            '&.Mui-focused fieldset': { borderColor: '#3b82f6' },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Status</InputLabel>
                        <Select
                          name="status"
                          value={filter.status}
                          onChange={handleFilterChange}
                          label="Status"
                          sx={{
                            borderRadius: 2,
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#3b82f6' },
                          }}
                        >
                          <MenuItem value="all">All</MenuItem>
                          <MenuItem value="active">Active</MenuItem>
                          <MenuItem value="inactive">Inactive</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Collapse>
            </Card>
            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f0f4f8' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#111827' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#111827' }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#111827' }}>Contact Number</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#111827' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#111827' }}>Created At</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#111827' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredInstitutes
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((institute) => (
                      <TableRow key={institute._id} sx={{ '&:hover': { bgcolor: '#f9fafb' } }}>
                        <TableCell>{institute.name}</TableCell>
                        <TableCell>{institute.email}</TableCell>
                        <TableCell>{institute.contactNumber || 'N/A'}</TableCell>
                        <TableCell sx={{ color: institute.subscriptionStatus === 'active' ? '#16a34a' : '#ef4444' }}>
                          {institute.subscriptionStatus.charAt(0).toUpperCase() + institute.subscriptionStatus.slice(1)}
                        </TableCell>
                        <TableCell>{new Date(institute.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell sx={{ display: 'flex', gap: 1 }}>
                          {institute.subscriptionStatus === 'active' ? (
                            <Button
                              variant="contained"
                              color="error"
                              size="small"
                              onClick={() => handleBanInstitute(institute._id)}
                              sx={{ textTransform: 'none', borderRadius: 1 }}
                            >
                              Ban
                            </Button>
                          ) : (
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={() => handleUnbanInstitute(institute._id)}
                              sx={{ textTransform: 'none', borderRadius: 1 }}
                            >
                              Unban
                            </Button>
                          )}
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => handleOpenEditModal(institute)}
                            sx={{ textTransform: 'none', borderRadius: 1 }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="contained"
                            color="secondary"
                            size="small"
                            onClick={() => handleRemoveInstitute(institute._id)}
                            sx={{ textTransform: 'none', borderRadius: 1 }}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[8]}
              component="div"
              count={filteredInstitutes.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              sx={{ mt: 2 }}
            />
          </Box>
        </Box>
      </Box>

      <Modal
        open={editModalOpen}
        onClose={handleCloseEditModal}
        closeAfterTransition
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Fade in={editModalOpen}>
          <Box
            sx={{
              bgcolor: '#ffffff',
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              p: 4,
              width: '90%',
              maxWidth: 500,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#111827', mb: 3 }}>
              Edit Institute
            </Typography>
            <form onSubmit={handleEditSubmit}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={editFormData.name}
                onChange={handleEditFormChange}
                error={!!editErrors.name}
                helperText={editErrors.name}
                sx={{ mb: 2 }}
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={editFormData.email}
                onChange={handleEditFormChange}
                error={!!editErrors.email}
                helperText={editErrors.email}
                sx={{ mb: 2 }}
                variant="outlined"
              />
              <TextField
                fullWidth
                label="Contact Number"
                name="contactNumber"
                value={editFormData.contactNumber}
                onChange={handleEditFormChange}
                error={!!editErrors.contactNumber}
                helperText={editErrors.contactNumber}
                sx={{ mb: 3 }}
                variant="outlined"
              />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={handleCloseEditModal}
                  sx={{ textTransform: 'none', borderRadius: 1 }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ textTransform: 'none', borderRadius: 1 }}
                >
                  Save
                </Button>
              </Box>
            </form>
          </Box>
        </Fade>
      </Modal>

      <Modal
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        closeAfterTransition
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Fade in={confirmModalOpen}>
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
              Confirm Action
            </Typography>
            <Typography variant="body1" sx={{ color: '#6b7280', mb: 3 }}>
              {confirmMessage}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => setConfirmModalOpen(false)}
                sx={{ textTransform: 'none', borderRadius: 1 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={confirmAction}
                sx={{ textTransform: 'none', borderRadius: 1 }}
              >
                Confirm
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default InstituteList;