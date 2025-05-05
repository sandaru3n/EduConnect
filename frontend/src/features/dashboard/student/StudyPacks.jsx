import StudentSidebar from "../../../components/StudentSidebar/index";
import StudentHeader from "../../../components/StudentHeader/index";
import { Breadcrumbs, Link as MuiLink, Typography, Box, Card, CardContent, CardMedia, Button, Grid, CircularProgress, Alert } from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from 'axios';
import { FaVideo, FaFilePdf, FaLink } from 'react-icons/fa';

const StudyPacks = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [studyPacks, setStudyPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

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
    const fetchStudyPacks = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
        const { data } = await axios.get('http://localhost:5000/api/studypacks', config);
        setStudyPacks(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch study packs');
        setLoading(false);
      }
    };
    fetchStudyPacks();
  }, []);

  const handlePay = (studyPackId) => {
    navigate(`/student/studypacks/payment/${studyPackId}`);
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
    document.title = `${pageTitle} - Student Dashboard - EduConnect`;
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
      <StudentHeader 
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
          <StudentSidebar 
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
              <MuiLink component={Link} to="/student/dashboard" className="hover:text-blue-600">
                Dashboard
              </MuiLink>
              {breadcrumbItems}
            </Breadcrumbs>
          </div>

          <Box sx={{ maxWidth: 1200, mx: 'auto', mt: '40px' }}>
            <Typography variant="h4" sx={{ fontSize: { xs: '1.875rem', md: '2.25rem' }, fontWeight: 700, color: '#111827', mb: 6 }}>
              Available Study Packs
            </Typography>
            <Grid container spacing={3}>
              {studyPacks.map(pack => (
                <Grid item xs={12} sm={6} md={4} key={pack._id}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      bgcolor: '#ffffff', 
                      borderRadius: 3, 
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
                      transition: 'all 0.3s ease',
                      overflow: 'hidden',
                      '&:hover': { 
                        transform: 'translateY(-5px)', 
                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)' 
                      }
                    }}
                  >
                    <CardMedia
                      component="img"
                      sx={{ height: 160, objectFit: 'cover', borderBottom: '1px solid #e5e7eb' }}
                      image={pack.coverPhotoUrl || 'https://via.placeholder.com/300x160?text=Study+Pack'}
                      alt={pack.title}
                    />
                    <CardContent sx={{ flex: 1, p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontSize: '1.25rem', 
                          fontWeight: 600, 
                          color: '#111827', 
                          mb: 1, 
                          lineHeight: 1.4,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {pack.title}
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, color: '#6b7280' }}>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                          <span style={{ fontWeight: 500, color: '#374151' }}>Subject:</span> {pack.subject}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                          <span style={{ fontWeight: 500, color: '#374151' }}>Price:</span> 
                          <span style={{ color: '#16a34a', fontWeight: 600 }}> ${pack.price}</span>
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                          <FaVideo style={{ color: '#4f46e5' }} /> 
                          <span style={{ fontWeight: 500, color: '#374151' }}>Videos:</span> {pack.fileCount.videos}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                          <FaFilePdf style={{ color: '#dc2626' }} /> 
                          <span style={{ fontWeight: 500, color: '#374151' }}>PDFs:</span> {pack.fileCount.pdfs}
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                          <FaLink style={{ color: '#2563eb' }} /> 
                          <span style={{ fontWeight: 500, color: '#374151' }}>URLs:</span> {pack.fileCount.urls}
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        onClick={() => handlePay(pack._id)}
                        sx={{
                          mt: 'auto',
                          width: '100%',
                          bgcolor: '#4f46e5',
                          color: '#ffffff',
                          fontWeight: 500,
                          py: 1.5,
                          borderRadius: 2,
                          textTransform: 'none',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          '&:hover': {
                            bgcolor: '#4338ca',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            transform: 'scale(1.02)',
                            transition: 'all 0.2s ease'
                          }
                        }}
                      >
                        Purchase Now
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default StudyPacks;