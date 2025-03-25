//frontend/src/features/dashboard/admin/AdminPages.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Container, Typography, List, ListItem, ListItemText, CircularProgress, Paper, Button } from "@mui/material";

import { Breadcrumbs, Link as MuiLink } from "@mui/material";
import { useLocation } from "react-router-dom";
import AdminSidebar from "../../../components/AdminSidebar/index";
import AdminHeader from "../../../components/AdminHeader/index";

const AdminPages = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/pages");
      const data = await response.json();
      setPages(data);
    } catch (error) {
      console.error("Error fetching pages:", error);
    } finally {
      setLoading(false);
    }
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

  const pathnames = location.pathname.split("/").filter((x) => x);
  const breadcrumbItems = pathnames.map((value, index) => {
    const last = index === pathnames.length - 1;
    const to = `/${pathnames.slice(0, index + 1).join("/")}`;
    const displayName = value.charAt(0).toUpperCase() + value.slice(1);

    return last ? (
      <Typography key={to} color="text.primary">
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
    document.title = `${pageTitle} - Admin Panel`; // You can customize the format
  }, [location, pageTitle]);

  return (
    <div>
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
            className={`mt-[50px] py-2 px-4 md:px-6 bg-gray-100 border-b fixed top-0 w-full z-30 transition-all duration-300 ${
              isSidebarCollapsed 
                ? "ml-[60px] w-[calc(100%-60px)]" 
                : "ml-[18%] w-[calc(100%-18%)] md:ml-[250px] md:w-[calc(100%-250px)]"
            }`}
          >
            {/* Breadcrumbs */}
        <div
          className={`mt-[50px] py-2 px-4 md:px-6 bg-gray-100 border-b transition-all duration-300 z-30 fixed top-0 left-0 w-full ${
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
          </div></div>
        
          
          <div className="mt-[90px] p-4 md:p-6 overflow-y-auto h-[calc(100vh-90px)]">
          <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        Manage Pages
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <Paper elevation={3} sx={{ p: 3 }}>
          <List>
            {pages.map((page) => (
              <ListItem key={page._id}>
                <ListItemText primary={page.title} />
                <Button variant="contained" component={Link} to={`/admin/pages/edit-page/${page.slug}`}>
                  Edit
                </Button>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Container>
              
            </div>
          </div>
        </div>
      </div>
    
  );
};

export default AdminPages;
