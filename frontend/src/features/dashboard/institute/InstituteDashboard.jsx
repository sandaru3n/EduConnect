import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import InstituteSidebar from "../../../components/InstituteSidebar/index";
import InstituteHeader from "../../../components/InstituteHeader/index";

const InstituteDashboard = () => {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
              
              {breadcrumbItems}
            </Breadcrumbs>
          </div>

          <Box sx={{ mt: '40px' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', mb: 2 }}>
              Institute Dashboard
            </Typography>
            <Typography sx={{ color: '#6b7280', mb: 4 }}>
              Manage your institute's activities and resources.
            </Typography>
            {/* Add other dashboard content here */}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default InstituteDashboard;