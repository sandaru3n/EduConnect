import { useState, useEffect } from "react";
import { Breadcrumbs, Link as MuiLink, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import TeacherSidebar from "../../../components/TeacherSidebar/index";
import TeacherHeader from "../../../components/TeacherHeader/index";

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
        const displayName = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' '); // Replace hyphens with spaces for display

        return last ? (
            <Typography
                key={to}
                sx={{
                    color: '#1f2937', // Dark gray for the last item
                    fontWeight: 'medium',
                    fontSize: { xs: '0.85rem', md: '0.875rem' },
                }}
            >
                {displayName}
            </Typography>
        ) : (
            <MuiLink
                key={to}
                component={Link}
                to={to}
                underline="none"
                sx={{
                    color: '#3b82f6', // Blue for non-last items
                    fontWeight: 500,
                    fontSize: { xs: '0.85rem', md: '0.875rem' },
                    '&:hover': {
                        textDecoration: 'underline',
                    },
                }}
            >
                {displayName}
            </MuiLink>
        );
    });

    // Get the current page name for the tab title
    const pageTitle = pathnames.length > 0
        ? pathnames[pathnames.length - 1].charAt(0).toUpperCase() + pathnames[pathnames.length - 1].slice(1).replace(/-/g, ' ')
        : "Dashboard"; // Default title if no pathnames

    // Update document title when location changes
    useEffect(() => {
        document.title = `${pageTitle} - EduConnect`;
    }, [location, pageTitle]);

    return (
        <div>
            <TeacherHeader
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
                    <TeacherSidebar
                        isCollapsed={isSidebarCollapsed}
                        toggleSidebar={toggleSidebar}
                    />
                </div>

                <div
                    className={`flex-1 transition-all duration-300 ${
                        isSidebarCollapsed ? "ml-[60px]" : "ml-[18%] md:ml-[250px]"
                    }`}
                >
                    {/* Breadcrumbs */}
                    <div
                        className={`py-3 px-4 md:px-6 fixed top-[64px] right-2 z-30 transition-all duration-300 ${
                            isSidebarCollapsed ? "ml-[60px] w-[calc(100%-60px)]" : "ml-[18%] w-[calc(100%-18%)] md:ml-[250px] md:w-[calc(100%-250px)]"
                        } bg-white border-b border-gray-200 shadow-sm`}
                    >
                        <Breadcrumbs
                            aria-label="breadcrumb"
                            separator={<span className="text-gray-400 mx-1">{'>'}</span>}
                            sx={{
                                '& .MuiBreadcrumbs-ol': {
                                    alignItems: 'center',
                                },
                            }}
                        >
                            {/* Only show "Dashboard" on /teacher/dashboard */}
                            {location.pathname === "/teacher/dashboard" ? (
                                <Typography
                                    sx={{
                                        color: '#1f2937',
                                        fontWeight: 'medium',
                                        fontSize: { xs: '0.85rem', md: '0.875rem' },
                                    }}
                                >
                                    Dashboard
                                </Typography>
                            ) : (
                                <>
                                    <MuiLink
                                        component={Link}
                                        to="/teacher"
                                        underline="none"
                                        sx={{
                                            color: '#3b82f6',
                                            fontWeight: 500,
                                            fontSize: { xs: '0.85rem', md: '0.875rem' },
                                            '&:hover': {
                                                textDecoration: 'underline',
                                            },
                                        }}
                                    >
                                        Home
                                    </MuiLink>
                                    {breadcrumbItems}
                                </>
                            )}
                        </Breadcrumbs>
                    </div>

                    {/* Main Content */}
                    <div className="mt-[104px] p-4 md:p-6 overflow-y-auto h-[calc(100vh-104px)]">
                        <h1 className="text-xl md:text-2xl font-semibold text-black">Welcome to Teacher Dashboard</h1>
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