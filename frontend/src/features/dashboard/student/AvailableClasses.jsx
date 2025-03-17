//frontend/src/features/dashboard/student/AvailableClasses.jsx
import { Routes, Route } from "react-router-dom";
import ClassList from "./ClassList";
import PaymentForm from "./PaymentForm";
import MyClasses from "./MyClasses";
import ClassMaterials from "./ClassMaterials";
import StudentSidebar from "../../../components/StudentSidebar/index";
import StudentHeader from "../../../components/StudentHeader/index";
import { Breadcrumbs, Link as MuiLink, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const AvailableClasses = () => {
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
            <Typography key={to} color="text.primary">
                {displayName}
            </Typography>
        ) : (
            <MuiLink key={to} component={Link} to={to} underline="hover" color="inherit">
                {displayName}
            </MuiLink>
        );
    });

    const pageTitle =
        pathnames.length > 0
            ? pathnames[pathnames.length - 1].charAt(0).toUpperCase() + pathnames[pathnames.length - 1].slice(1)
            : "Dashboard";

    useEffect(() => {
        document.title = `${pageTitle} - Student Dashboard - EduConnect`;
    }, [location, pageTitle]);

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col">
            {/* Header */}
            <StudentHeader isSidebarCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} isMobile={isMobile} />

            <div className="flex flex-1">
                {/* Sidebar */}
                <div
                    className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 bg-white shadow-lg ${
                        isSidebarCollapsed ? "w-[60px]" : "w-[18%] md:w-[250px]"
                    }`}
                >
                    <StudentSidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
                </div>

                {/* Main Content */}
                <div
                    className={`flex-1 transition-all duration-300 ${
                        isSidebarCollapsed ? "ml-[60px]" : "ml-[18%] md:ml-[250px]"
                    } p-6`}
                >
                    {/* Breadcrumb Navigation */}
                    <div className="bg-white p-4 rounded-lg shadow-md mb-4 mt-12"> {/* Changed to mt-12 for more spacing */}
                        <Breadcrumbs aria-label="breadcrumb">
                            <MuiLink component={Link} to="/student" underline="hover" color="inherit">
                                Student
                            </MuiLink>
                            {breadcrumbItems}
                        </Breadcrumbs>
                    </div>


                    {/* Page Content */}
                    <div className="bg-white p-6 rounded-lg shadow-lg min-h-[80vh]">
                        <Routes>
                            <Route path="/" element={<ClassList />} />
                            <Route path="/subscribe/:classId" element={<PaymentForm />} />
                            <Route path="/my-classes" element={<MyClasses />} />
                            <Route path="/my-classes/:classId/materials" element={<ClassMaterials />} />
                        </Routes>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AvailableClasses;