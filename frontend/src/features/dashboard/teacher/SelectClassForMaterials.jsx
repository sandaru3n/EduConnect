import { useState, useEffect } from "react";
import { Breadcrumbs, Link as MuiLink, Typography, Box, Grid, Card, CardContent, Button } from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import TeacherSidebar from "../../../components/TeacherSidebar/index";
import TeacherHeader from "../../../components/TeacherHeader/index";
import axios from "axios";

const SelectClassForMaterials = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [classes, setClasses] = useState([]);
    const [error, setError] = useState(null);

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

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem("userInfo"));
                const config = {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                };

                const { data } = await axios.get("http://localhost:5000/api/teacher/classes", config);
                setClasses(data);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to fetch classes");
            }
        };
        fetchClasses();
    }, []);

    const handleClassSelect = (classId) => {
        navigate(`/${classId}/materials`);
    };

    const pathnames = location.pathname.split("/").filter((x) => x);
    const breadcrumbItems = pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const displayName = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');

        return last ? (
            <Typography
                key={to}
                sx={{
                    color: '#1f2937',
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
                    color: '#3b82f6',
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

    const pageTitle = pathnames.length > 0
        ? pathnames[pathnames.length - 1].charAt(0).toUpperCase() + pathnames[pathnames.length - 1].slice(1).replace(/-/g, ' ')
        : "Select Class";

    useEffect(() => {
        document.title = `${pageTitle} - EduConnect`;
    }, [location, pageTitle]);

    return (
        <div className="bg-gray-50 min-h-screen">
            <TeacherHeader
                isSidebarCollapsed={isSidebarCollapsed}
                toggleSidebar={toggleSidebar}
                isMobile={isMobile}
            />
            <div className="flex min-h-screen">
                {/* Sidebar */}
                <div className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 ${
                    isSidebarCollapsed ? "w-[60px]" : "w-[18%] md:w-[250px]"
                } bg-white border-r border-gray-200`}>
                    <TeacherSidebar
                        isCollapsed={isSidebarCollapsed}
                        toggleSidebar={toggleSidebar}
                    />
                </div>

                {/* Main Content */}
                <div className={`flex-1 transition-all duration-300 ${
                    isSidebarCollapsed ? "ml-[60px]" : "ml-[18%] md:ml-[250px]"
                }`}>
                    {/* Breadcrumbs */}
                    <div className={`py-3 px-4 md:px-6 fixed top-[64px] right-2 z-30 transition-all duration-300 ${
                        isSidebarCollapsed ? "ml-[60px] w-[calc(100%-60px)]" : "ml-[18%] w-[calc(100%-18%)] md:ml-[250px] md:w-[calc(100%-250px)]"
                    } bg-white border-b border-gray-200 shadow-sm`}>
                        <Breadcrumbs aria-label="breadcrumb" separator="›" className="text-gray-600">
                            <MuiLink component={Link} to="/teacher" className="hover:text-blue-600">
                                Dashboard
                            </MuiLink>
                            {breadcrumbItems}
                        </Breadcrumbs>
                    </div>

                    {/* Classes List */}
                    <div className="mt-[104px] p-4 md:p-6 overflow-y-auto h-[calc(100vh-104px)]">
                        <Box sx={{ maxWidth: 1200, mx: "auto", p: 4 }}>
                            <Typography variant="h4" gutterBottom sx={{ mb: 4, color: 'text.primary', fontWeight: 700 }}>
                                Select Class to Manage Materials
                            </Typography>

                            {error && (
                                <Alert severity="error" sx={{ mb: 3 }}>
                                    {error}
                                </Alert>
                            )}

                            {classes.length === 0 ? (
                                <Typography variant="body1" color="text.secondary">
                                    No classes found. Start by creating a class.
                                </Typography>
                            ) : (
                                <Grid container spacing={3}>
                                    {classes.map(cls => (
                                        <Grid item xs={12} md={6} lg={4} key={cls._id}>
                                            <Card sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.05)', borderRadius: 3 }}>
                                                <CardContent>
                                                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 500 }}>
                                                        {cls.subject}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                        Monthly Fee: ${cls.monthlyFee}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                        {cls.description || "No description available"}
                                                    </Typography>
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        onClick={() => handleClassSelect(cls._id)}
                                                        sx={{ 
                                                            background: 'linear-gradient(45deg, #4f46e5 30%, #6366f1 90%)',
                                                            '&:hover': {
                                                                background: 'linear-gradient(45deg, #4338ca 30%, #4f46e5 90%)',
                                                            }
                                                        }}
                                                    >
                                                        Manage Materials
                                                    </Button>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </Box>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SelectClassForMaterials;