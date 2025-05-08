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

const TeacherList = () => {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    age: '',
    contactNumber: ''
  });
  const [editErrors, setEditErrors] = useState({});
  const [filter, setFilter] = useState({
    name: '',
    email: '',
    ageMin: '',
    ageMax: '',
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
    const fetchTeachers = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
        const { data } = await axios.get(`${BASE_URL}/api/admin/teachers`, config);
        setTeachers(data);
        setFilteredTeachers(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch teachers. Please try again later.');
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...teachers];

      if (filter.name) {
        filtered = filtered.filter(teacher =>
          teacher.name.toLowerCase().includes(filter.name.toLowerCase())
        );
      }

      if (filter.email) {
        filtered = filtered.filter(teacher =>
          teacher.email.toLowerCase().includes(filter.email.toLowerCase())
        );
      }

      if (filter.ageMin || filter.ageMax) {
        filtered = filtered.filter(teacher => {
          const age = parseInt(teacher.age) || 0;
          const min = parseInt(filter.ageMin) || 0;
          const max = parseInt(filter.ageMax) || Infinity;
          return age >= min && age <= max;
        });
      }

      if (filter.status !== 'all') {
        filtered = filtered.filter(teacher => teacher.subscriptionStatus === filter.status);
      }

      setFilteredTeachers(filtered);
      setPage(0); // Reset to first page when filters change
    };

    applyFilters();
  }, [filter, teachers]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
  };

  const handleBanTeacher = async (teacherId) => {
    setSelectedTeacherId(teacherId);
    setConfirmMessage('Are you sure you want to ban this teacher?');
    setConfirmAction(() => async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
        await axios.put(`${BASE_URL}/api/admin/teachers/${teacherId}/ban`, {}, config);
        setTeachers(teachers.map(teacher =>
          teacher._id === teacherId ? { ...teacher, subscriptionStatus: 'inactive' } : teacher
        ));
        setConfirmModalOpen(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to ban teacher. Please try again later.');
        setConfirmModalOpen(false);
      }
    });
    setConfirmModalOpen(true);
  };

  const handleUnbanTeacher = async (teacherId) => {
    setSelectedTeacherId(teacherId);
    setConfirmMessage('Are you sure you want to unban this teacher?');
    setConfirmAction(() => async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
        await axios.put(`${BASE_URL}/api/admin/teachers/${teacherId}/unban`, {}, config);
        setTeachers(teachers.map(teacher =>
          teacher._id === teacherId ? { ...teacher, subscriptionStatus: 'active' } : teacher
        ));
        setConfirmModalOpen(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to unban teacher. Please try again later.');
        setConfirmModalOpen(false);
      }
    });
    setConfirmModalOpen(true);
  };

  const handleRemoveTeacher = async (teacherId) => {
    setSelectedTeacherId(teacherId);
    setConfirmMessage('Are you sure you want to remove this teacher? This action cannot be undone.');
    setConfirmAction(() => async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
        await axios.delete(`${BASE_URL}/api/admin/teachers/${teacherId}`, config);
        setTeachers(teachers.filter(teacher => teacher._id !== teacherId));
        setConfirmModalOpen(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to remove teacher. Please try again later.');
        setConfirmModalOpen(false);
      }
    });
    setConfirmModalOpen(true);
  };

  const handleOpenEditModal = (teacher) => {
    setSelectedTeacher(teacher);
    setEditFormData({
      name: teacher.name,
      email: teacher.email,
      age: teacher.age || '',
      contactNumber: teacher.contactNumber || ''
    });
    setEditErrors({});
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedTeacher(null);
    setEditFormData({ name: '', email: '', age: '', contactNumber: '' });
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
    if (editFormData.age && (isNaN(editFormData.age) || editFormData.age <= 0)) errors.age = 'Age must be a positive number';
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
        `${BASE_URL}/api/admin/teachers/${selectedTeacher._id}`,
        editFormData,
        config
      );
      setTeachers(teachers.map(teacher =>
        teacher._id === selectedTeacher._id ? response.data.teacher : teacher
      ));
      handleCloseEditModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update teacher. Please try again later.');
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Age', 'Contact Number', 'Status', 'Created At'];
    const rows = filteredTeachers.map(teacher => [
      `"${teacher.name}"`,
      `"${teacher.email}"`,
      teacher.age || 'N/A',
      teacher.contactNumber || 'N/A',
      teacher.subscriptionStatus,
      new Date(teacher.createdAt).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'teachers_list.csv';
    link.click();
  };

  // Export to PDF using jsPDF and jspdf-autotable
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Set document properties
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Teachers List", 14, 20);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Admin: ${JSON.parse(localStorage.getItem('userInfo'))?.name || 'EduConnect Admin'}`, 14, 40);

    // Prepare table data
    const tableData = filteredTeachers.map(teacher => [
      teacher.name,
      teacher.email,
      teacher.age || 'N/A',
      teacher.contactNumber || 'N/A',
      teacher.subscriptionStatus.charAt(0).toUpperCase() + teacher.subscriptionStatus.slice(1),
      new Date(teacher.createdAt).toLocaleDateString()
    ]);

    // Generate table using jspdf-autotable
    doc.autoTable({
      startY: 50,
      head: [['Name', 'Email', 'Age', 'Contact Number', 'Status', 'Created At']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] }, // Blue header (RGB equivalent of #3b82f6)
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 30 }, // Name
        1: { cellWidth: 40 }, // Email
        2: { cellWidth: 15 }, // Age
        3: { cellWidth: 30 }, // Contact Number
        4: { cellWidth: 20 }, // Status
        5: { cellWidth: 25 }, // Created At
      },
      margin: { top: 50 },
    });

    // Save the PDF
    doc.save(`Teachers_List_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`);
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
                All Teachers List
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
                      <TextField
                        fullWidth
                        label="Min Age"
                        name="ageMin"
                        value={filter.ageMin}
                        onChange={handleFilterChange}
                        variant="outlined"
                        size="small"
                        type="number"
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
                      <TextField
                        fullWidth
                        label="Max Age"
                        name="ageMax"
                        value={filter.ageMax}
                        onChange={handleFilterChange}
                        variant="outlined"
                        size="small"
                        type="number"
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
                    <TableCell sx={{ fontWeight: 600, color: '#111827' }}>Age</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#111827' }}>Contact Number</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#111827' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#111827' }}>Created At</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#111827' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTeachers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((teacher) => (
                      <TableRow key={teacher._id} sx={{ '&:hover': { bgcolor: '#f9fafb' } }}>
                        <TableCell>{teacher.name}</TableCell>
                        <TableCell>{teacher.email}</TableCell>
                        <TableCell>{teacher.age || 'N/A'}</TableCell>
                        <TableCell>{teacher.contactNumber || 'N/A'}</TableCell>
                        <TableCell sx={{ color: teacher.subscriptionStatus === 'active' ? '#16a34a' : '#ef4444' }}>
                          {teacher.subscriptionStatus.charAt(0).toUpperCase() + teacher.subscriptionStatus.slice(1)}
                        </TableCell>
                        <TableCell>{new Date(teacher.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell sx={{ display: 'flex', gap: 1 }}>
                          {teacher.subscriptionStatus === 'active' ? (
                            <Button
                              variant="contained"
                              color="error"
                              size="small"
                              onClick={() => handleBanTeacher(teacher._id)}
                              sx={{ textTransform: 'none', borderRadius: 1 }}
                            >
                              Ban
                            </Button>
                          ) : (
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={() => handleUnbanTeacher(teacher._id)}
                              sx={{ textTransform: 'none', borderRadius: 1 }}
                            >
                              Unban
                            </Button>
                          )}
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => handleOpenEditModal(teacher)}
                            sx={{ textTransform: 'none', borderRadius: 1 }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="contained"
                            color="secondary"
                            size="small"
                            onClick={() => handleRemoveTeacher(teacher._id)}
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
              count={filteredTeachers.length}
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
              Edit Teacher
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
                label="Age"
                name="age"
                value={editFormData.age}
                onChange={handleEditFormChange}
                error={!!editErrors.age}
                helperText={editErrors.age}
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

export default TeacherList;