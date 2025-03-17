//frontend/src/features/dashboard/student/MyClasses.jsx
import StudentSidebar from "../../../components/StudentSidebar/index";
import StudentHeader from "../../../components/StudentHeader/index";
import { Breadcrumbs, Link as MuiLink, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MyClasses = () => {
    const [classes, setClasses] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    useEffect(() => {
        const fetchMyClasses = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem("userInfo"));
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get("http://localhost:5000/api/subscriptions/my-classes", config);
                setClasses(data);
            } catch (error) {
                console.error("Error fetching my classes:", error);
            }
        };
        fetchMyClasses();
    }, []);

    const viewMaterials = (classId) => {
        navigate(`/student/dashboard/my-classes/${classId}/materials`);
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
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <StudentHeader isSidebarCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} isMobile={isMobile} />

            <div className="flex flex-1">
                {/* Sidebar */}
                <div
                    className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 bg-[#fff] border-r border-[rgba(0,0,0,0.1)] ${
                        isSidebarCollapsed ? "w-16" : "w-64"
                    } ${isMobile ? "md:w-64" : ""}`}
                >
                    <StudentSidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
                </div>

                {/* Main Content */}
                <div
                    className={`flex-1 transition-all duration-300 ${
                        isSidebarCollapsed ? "ml-16" : "ml-64"
                    } ${isMobile ? "md:ml-64" : ""} pt-16 md:pt-16 p-4 md:p-6`} // Adjusted padding-top for header
                >
                    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                        <Breadcrumbs aria-label="breadcrumb" className="text-sm">
                            <MuiLink component={Link} to="/student" underline="hover" color="inherit">
                                Student
                            </MuiLink>
                            {breadcrumbItems}
                        </Breadcrumbs>
                    </div>

                    {/* My Classes Section */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">My Classes</h2>
                        {classes.length === 0 ? (
                            <p className="text-gray-500 text-center py-6">You are not subscribed to any classes yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {classes.map((cls) => (
                                    <div
                                        key={cls._id}
                                        className="bg-blue-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{cls.subject}</h3>
                                        <p className="text-gray-600 text-sm mb-1">
                                            Monthly Fee: <span className="font-medium">${cls.monthlyFee}</span>
                                        </p>
                                        <p className="text-gray-600 text-sm mb-4">
                                            Teacher: <span className="font-medium">{cls.teacherId.name}</span>
                                        </p>
                                        <button
                                            onClick={() => viewMaterials(cls._id)}
                                            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium"
                                        >
                                            View Materials
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyClasses;