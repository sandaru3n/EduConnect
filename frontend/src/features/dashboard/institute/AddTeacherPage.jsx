import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Snackbar,
  Breadcrumbs,
} from '@mui/material';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import InstituteSidebar from "../../../components/InstituteSidebar/index";
import InstituteHeader from "../../../components/InstituteHeader/index";
import { Link as MuiLink } from '@mui/material';

const BASE_URL = 'http://localhost:5000';

const AddTeacherPage = () => {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
  });
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [defaultPassword, setDefaultPassword] = useState('');
  const [copied, setCopied] = useState(false);

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
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
      const response = await axios.get(`${BASE_URL}/api/auth/teachers`, config);
      setTeachers(response.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setError('Failed to load teachers. Please try again later.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    setDefaultPassword('');

    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
      const response = await axios.post(`${BASE_URL}/api/auth/add-teacher`, formData, config);

      setSuccessMessage(response.data.message);
      setDefaultPassword(response.data.teacher.defaultPassword);
      setFormData({ name: '', email: '', age: '' });
      fetchTeachers(); // Refresh the teacher list
    } catch (error) {
      console.error('Add teacher error:', error);
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
    document.title = `${pageTitle} - Institute Dashboard - EduConnect`;
  }, [location, pageTitle]);

  return (
    <Box sx={{ bgcolor: '#f3f4f6', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
      <InstituteHeader 
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
          <InstituteSidebar 
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
              <MuiLink component={Link} to="/institute/dashboard" className="hover:text-blue-600">
                Dashboard
              </MuiLink>
              {breadcrumbItems}
            </Breadcrumbs>
          </div>

          <Box sx={{ maxWidth: 1200, mx: 'auto', mt: '40px' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', mb: 2 }}>
              Add New Teacher
            </Typography>
            <Typography sx={{ color: '#6b7280', mb: 4 }}>
              Add teachers to your institute. They will be created with a default password.
            </Typography>

            {/* Error/Success Messages */}
            {error && (
              <Alert severity="error" sx={{ mb: 4, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                {error}
              </Alert>
            )}
            {successMessage && (
              <Alert severity="success" sx={{ mb: 4, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                {successMessage}
                {defaultPassword && (
                  <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">
                      Default Password: <strong>{defaultPassword}</strong>
                    </Typography>
                    <CopyToClipboard text={defaultPassword} onCopy={handleCopy}>
                      <IconButton size="small">
                        <FileCopyIcon fontSize="small" />
                      </IconButton>
                    </CopyToClipboard>
                  </Box>
                )}
              </Alert>
            )}

            <Snackbar
              open={copied}
              autoHideDuration={2000}
              message="Password copied to clipboard!"
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            />

            {/* Add Teacher Form */}
            <Paper sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden', mb: 4 }}>
              <Box sx={{ bgcolor: '#4f46e5', p: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#ffffff' }}>
                  Add Teacher
                </Typography>
              </Box>
              <Box sx={{ p: 3 }}>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#111827', mb: 1 }}>
                      Name <span className="text-red-500">*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      variant="outlined"
                      size="small"
                      placeholder="Enter teacher's name"
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
                      Email <span className="text-red-500">*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      variant="outlined"
                      size="small"
                      placeholder="Enter teacher's email"
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
                      Age <span className="text-red-500">*</span>
                    </Typography>
                    <TextField
                      fullWidth
                      id="age"
                      name="age"
                      type="number"
                      value={formData.age}
                      onChange={handleChange}
                      variant="outlined"
                      size="small"
                      placeholder="Enter teacher's age"
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

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2, borderTop: '1px solid #e5e7eb' }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      sx={{
                        textTransform: 'none',
                        borderRadius: 1,
                        bgcolor: '#4f46e5',
                        '&:hover': { bgcolor: '#4338ca' },
                        '&:disabled': { bgcolor: '#a5b4fc', cursor: 'not-allowed' }
                      }}
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
                          Adding...
                        </span>
                      ) : 'Add Teacher'}
                    </Button>
                  </Box>
                </form>
              </Box>
            </Paper>

            {/* Teachers List */}
            <Paper sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
              <Box sx={{ bgcolor: '#4f46e5', p: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#ffffff' }}>
                  Added Teachers
                </Typography>
              </Box>
              <Box sx={{ p: 3 }}>
                {teachers.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" sx={{ color: '#111827', fontSize: '1rem' }}>
                      No teachers added yet.
                    </Typography>
                    <Typography sx={{ color: '#6b7280', fontSize: '0.875rem' }}>
                      Start by adding a new teacher using the form above.
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table sx={{ '& .MuiTableCell-root': { py: 1, px: 2, fontSize: '0.875rem' } }}>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f0f4f8' }}>
                          <TableCell sx={{ fontWeight: 600, color: '#111827' }}>Name</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#111827' }}>Email</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#111827' }}>Age</TableCell>
                          <TableCell sx={{ fontWeight: 600, color: '#111827' }}>Created At</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {teachers.map((teacher) => (
                          <TableRow key={teacher._id} sx={{ '&:hover': { bgcolor: '#f9fafb' } }}>
                            <TableCell>{teacher.name}</TableCell>
                            <TableCell>{teacher.email}</TableCell>
                            <TableCell>{teacher.age}</TableCell>
                            <TableCell>{new Date(teacher.createdAt).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AddTeacherPage;