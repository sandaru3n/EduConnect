//frontend/src/features/dashboard/institute/InstituteDashboard.jsx
import { useState, useEffect } from "react";
import { Breadcrumbs, Link as MuiLink, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import InstituteSidebar from "../../../components/InstituteSidebar/index";
import InstituteHeader from "../../../components/InstituteHeader/index";

const TeacherDashboard = () => {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
    document.title = `Institute Dashboard - EduConnect`; // You can customize the format
  }, [location, pageTitle]);

  return (
    <div>
      <InstituteHeader 
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
          <InstituteSidebar
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
            <MuiLink component={Link} to="/student" underline="hover" color="inherit">
              Student
            </MuiLink>
            {breadcrumbItems}
          </Breadcrumbs>
          </div></div>
        
          
          <div className="mt-[90px] p-4 md:p-6 overflow-y-auto h-[calc(100vh-90px)]">
          <h1 className="text-xl md:text-2xl font-semibold text-black">Welcome to institute Dashboard</h1>
            <div className="mt-4"> 
              <p className="text-gray-600">
                This is the main content area. You can add your dashboard widgets, tables, or charts here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
