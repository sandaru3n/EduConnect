//frontend/src/features/dashboard/student/StudentDashboard.jsx
import { Routes, Route } from 'react-router-dom';
import ClassList from './ClassList';
import PaymentForm from './PaymentForm';
import MyClasses from './MyClasses';
import PaymentHistory from './PaymentHistory'; // Import the new component
import ClassMaterials from './ClassMaterials';
import StudentSidebar from "../../../components/StudentSidebar/index";
import StudentHeader from "../../../components/StudentHeader/index";
import { Breadcrumbs, Link as MuiLink, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const StudentDashboard = () => {
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
        const displayName = value.charAt(0).toUpperCase() + value.slice(1);

        return last ? (
            <Typography key={to} color="text.primary">{displayName}</Typography>
        ) : (
            <MuiLink key={to} component={Link} to={to} underline="hover" color="inherit">
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

    return (
        <div>
            <StudentHeader 
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
                    <StudentSidebar 
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
                        <Breadcrumbs aria-label="breadcrumb">
                            <MuiLink component={Link} to="/student" underline="hover" color="inherit">
                                Student
                            </MuiLink>
                            {breadcrumbItems}
                        </Breadcrumbs>
                    </div>
                    
                    <div className="mt-[90px] p-4 md:p-6 overflow-y-auto h-[calc(100vh-90px)]">
                        <Routes>
                            <Route path="/" element={<ClassList />} />
                            <Route path="/subscribe/:classId" element={<PaymentForm />} />
                            <Route path="/my-classes" element={<MyClasses />} />
                            <Route path="/my-classes/:classId/materials" element={<ClassMaterials />} />
                            <Route path="/payment-history" element={<PaymentHistory />} /> {/* New route */}
                        </Routes>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;