//frontend/src/features/dashboard/admin/ContactMessages.jsx
import { useState, useEffect } from "react";
import { 
  Breadcrumbs, 
  Link as MuiLink, 
  Typography, 
  Box, 
  Paper, 
  Button, 
  CircularProgress, 
  Table,
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Alert 
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import AdminSidebar from "../../../components/AdminSidebar/index";
import AdminHeader from "../../../components/AdminHeader/index";
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const location = useLocation();

  const fetchMessages = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/contact', config);
      setMessages(data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch messages');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.delete(`http://localhost:5000/api/contact/${id}`, config);
        setMessages(messages.filter((msg) => msg._id !== id));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete message');
      }
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  useEffect(() => {
    // Handle responsive behavior
    const handleResize = () => {
      const mobileView = window.innerWidth <= 768;
      setIsMobile(mobileView);
      setIsSidebarCollapsed(mobileView);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    
    // Fetch messages if admin
    if (userInfo?.role === 'admin') {
      fetchMessages();
    }

    return () => window.removeEventListener("resize", handleResize);
  }, [userInfo]);

  // Breadcrumb and title logic
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

  const pageTitle = pathnames.length > 0
    ? pathnames[pathnames.length - 1].charAt(0).toUpperCase() + pathnames[pathnames.length - 1].slice(1)
    : "Dashboard";

  useEffect(() => {
    document.title = `${pageTitle} - Admin Panel`;
  }, [location, pageTitle]);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (userInfo?.role !== 'admin') return <Typography>Access Denied</Typography>;

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
          <div
            className={`mt-[50px] py-3 px-6 bg-white border-b shadow-sm transition-all duration-300 z-30 fixed top-0 left-0 w-full ${
              isSidebarCollapsed
                ? "ml-[60px] w-[calc(100%-60px)]"
                : "ml-[18%] w-[calc(100%-18%)] md:ml-[250px] md:w-[calc(100%-250px)]"
            }`}
          >
            <Breadcrumbs aria-label="breadcrumb">
              <MuiLink component={Link} to="/admin" underline="hover" color="inherit">
                Admin
              </MuiLink>
              {breadcrumbItems}
            </Breadcrumbs>
          </div>

          <div className="mt-[100px] p-6 md:p-8 overflow-y-auto h-[calc(100vh-100px)]">
            <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
              <Typography variant="h4" gutterBottom>Contact Messages</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Message</TableCell>
                      <TableCell>Classification</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {messages.map((msg) => (
                      <TableRow key={msg._id}>
                        <TableCell>{msg.name}</TableCell>
                        <TableCell>{msg.email}</TableCell>
                        <TableCell>{msg.message}</TableCell>
                        <TableCell>{msg.classification}</TableCell>
                        <TableCell>{new Date(msg.createdAt).toLocaleString()}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDelete(msg._id)}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactMessages;