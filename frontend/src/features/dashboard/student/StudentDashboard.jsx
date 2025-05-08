import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { Breadcrumbs, Link as MuiLink, Typography, Skeleton, Tooltip, createTheme, ThemeProvider } from "@mui/material";
import { Link } from "react-router-dom";
import StudentSidebar from "../../../components/StudentSidebar/index";
import StudentHeader from "../../../components/StudentHeader/index";
import { motion } from "framer-motion";

// Define the base URL for the backend
const BASE_URL = 'http://localhost:5000';

// Create a custom MUI theme to apply the Roboto font globally
const theme = createTheme({
    typography: {
        fontFamily: 'Roboto, sans-serif',
        h2: {
            fontWeight: 600,
            color: '#1a202c',
        },
        h3: {
            fontWeight: 600,
            color: '#1a202c',
        },
        body1: {
            fontWeight: 400,
            color: '#6b7280',
        },
        body2: {
            fontWeight: 400,
            color: '#6b7280',
        },
    },
    components: {
        MuiTypography: {
            styleOverrides: {
                root: {
                    fontFamily: 'Roboto, sans-serif',
                },
            },
        },
    },
});

const StudentDashboard = () => {
    const [classes, setClasses] = useState([]);
    const [inactiveSubscriptions, setInactiveSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const fetchClasses = async () => {
            setLoading(true);
            try {
                const userInfo = JSON.parse(localStorage.getItem("userInfo"));
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get(`${BASE_URL}/api/subscriptions/my-classes`, config);
                console.log("Active Classes Data:", data);
                setClasses(data);

                // Fetch all subscriptions to identify inactive ones
                const { data: allSubscriptions } = await axios.get(`${BASE_URL}/api/subscriptions/payment-history`, config);
                console.log("All Subscriptions Data:", allSubscriptions);
                const inactive = allSubscriptions.filter(sub => sub.status === 'Inactive');
                console.log("Inactive Subscriptions:", inactive);
                setInactiveSubscriptions(inactive);
            } catch (error) {
                console.error("Error fetching classes:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchClasses();
    }, []);

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
                    fontSize: { xs: '0.9rem', md: '1rem' },
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
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    '&:hover': {
                        textDecoration: 'underline',
                    },
                }}
            >
                {displayName}
            </MuiLink>
        );
    });

    const viewMaterials = (classId) => {
        navigate(`/student/dashboard/my-classes/${classId}/materials`);
    };

    const handleReactivate = (classId) => {
        navigate(`/student/dashboard/subscribe/${classId}`);
    };

    // Sidebar logic
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
        if (typeof document !== 'undefined') {
            document.title = `My Classes - Student Dashboard - EduConnect`;
        }
    }, []);

    // Loading skeleton for cards
    const CardSkeleton = () => (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <Skeleton variant="rectangular" width="100%" height={150} sx={{ borderRadius: '8px', marginBottom: '16px' }} />
            <Skeleton variant="text" width="70%" height={24} />
            <Skeleton variant="text" width="50%" height={20} />
            <Skeleton variant="text" width="60%" height={20} />
            <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: '6px', marginTop: '16px' }} />
        </div>
    );

    // Card container animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    // Individual card animation variants
    const cardVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                damping: 15,
                stiffness: 100
            }
        },
        hover: {
            y: -5,
            boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
            transition: {
                type: "spring",
                stiffness: 300
            }
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <div className="bg-gray-50 min-h-screen flex flex-col">
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
                            isSidebarCollapsed ? "ml-[60px]" : "ml-[18%] md:ml-[280px]"
                        }`}
                    >
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
                                {breadcrumbItems}
                            </Breadcrumbs>
                        </div>

                        <div className="mt-[120px] p-4 md:p-6 overflow-y-auto h-[calc(100vh-120px)]">
                            <div className="max-w-7xl mx-auto pl-8 md:pl-12">
                                {/* Page Title */}
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="mb-8"
                                >
                                    <Typography
                                        variant="h4"
                                        gutterBottom
                                        sx={{
                                            fontWeight: 600,
                                            color: '#1a202c',
                                            fontSize: { xs: '1.5rem', md: '2rem' },
                                        }}
                                    >
                                        Student Dashboard
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            color: '#6b7280',
                                            fontSize: '1rem',
                                            mt: 1,
                                        }}
                                    >
                                        Manage your active and inactive class subscriptions
                                    </Typography>
                                </motion.div>

                                {/* Active Classes Section */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className="bg-white p-6 rounded-xl shadow-md mb-8 border border-gray-100"
                                >
                                    <div className="flex items-center mb-6">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                        </div>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 600,
                                                color: '#1a202c',
                                                fontSize: '1.5rem',
                                            }}
                                        >
                                            Active Classes
                                        </Typography>
                                    </div>

                                    {loading ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {[1, 2, 3].map((i) => (
                                                <CardSkeleton key={i} />
                                            ))}
                                        </div>
                                    ) : classes.length === 0 ? (
                                        <div className="bg-blue-50 rounded-lg p-8 text-center">
                                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <Typography variant="body1" sx={{ color: '#1a202c', fontSize: '1rem', mb: 2 }}>
                                                You are not subscribed to any active classes yet.
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '1rem', mb: 4 }}>
                                                Browse available classes to start your learning journey.
                                            </Typography>
                                            <button
                                                onClick={() => navigate('/student/dashboard/browse-classes')}
                                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300 font-medium inline-flex items-center text-base shadow-sm hover:shadow-md"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                Browse Classes
                                            </button>
                                        </div>
                                    ) : (
                                        <motion.div
                                            variants={containerVariants}
                                            initial="hidden"
                                            animate="visible"
                                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                                        >
                                            {classes.map((cls) => (
                                                <motion.div
                                                    key={cls._id}
                                                    variants={cardVariants}
                                                    whileHover="hover"
                                                    className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-gray-200 rounded-xl p-5 relative overflow-hidden"
                                                >
                                                    <div className="absolute right-0 top-0 h-16 w-16">
                                                        <div className="absolute transform rotate-45 bg-green-500 text-center text-white font-medium py-1 right-[-35px] top-[32px] w-[170px] text-base">Active</div>
                                                    </div>
                                                    {/* Cover Photo */}
                                                    {cls.coverPhoto ? (
                                                        <div className="w-full h-40 rounded-lg overflow-hidden mb-4 shadow-sm">
                                                            <img
                                                                src={`${BASE_URL}${cls.coverPhoto}`}
                                                                alt="Class Cover"
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    console.error(`Failed to load cover photo for active class ${cls._id}: ${BASE_URL}${cls.coverPhoto}`);
                                                                    e.target.style.display = 'none';
                                                                }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="w-full h-40 rounded-lg bg-gray-200 flex items-center justify-center mb-4 shadow-sm">
                                                            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem' }}>
                                                                No Cover Photo
                                                            </Typography>
                                                        </div>
                                                    )}
                                                    <Typography
                                                        variant="h6"
                                                        sx={{
                                                            fontWeight: 600,
                                                            color: '#1a202c',
                                                            mb: 2,
                                                            fontSize: '1.25rem',
                                                            pr: 8,
                                                        }}
                                                    >
                                                        {cls.subject}
                                                    </Typography>
                                                    <div className="flex items-center mb-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '1rem' }}>
                                                            <span className="font-medium">${cls.monthlyFee}</span> monthly
                                                        </Typography>
                                                    </div>
                                                    <div className="flex items-center mb-4">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                        </svg>
                                                        <Tooltip title="View teacher profile" placement="top">
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    color: '#6b7280',
                                                                    fontSize: '1rem',
                                                                    '&:hover': {
                                                                        color: '#3b82f6',
                                                                        cursor: 'pointer',
                                                                    },
                                                                }}
                                                            >
                                                                <span className="font-medium">{cls.teacherId.name}</span>
                                                            </Typography>
                                                        </Tooltip>
                                                    </div>
                                                    <button
                                                        onClick={() => viewMaterials(cls._id)}
                                                        className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300 font-medium flex items-center justify-center group text-base shadow-sm hover:shadow-md"
                                                    >
                                                        <span>View Materials</span>
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                        </svg>
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    )}
                                </motion.div>

                                {/* Inactive Classes Section */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.4 }}
                                    className="bg-white p-6 rounded-xl shadow-md border border-gray-100"
                                >
                                    <div className="flex items-center mb-6">
                                        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 600,
                                                color: '#1a202c',
                                                fontSize: '1.5rem',
                                            }}
                                        >
                                            Inactive Subscriptions
                                        </Typography>
                                    </div>

                                    {loading ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {[1, 2].map((i) => (
                                                <CardSkeleton key={i} />
                                            ))}
                                        </div>
                                    ) : inactiveSubscriptions.length === 0 ? (
                                        <div className="bg-gray-50 rounded-lg p-8 text-center">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <Typography variant="body1" sx={{ color: '#1a202c', fontSize: '1rem', mb: 2 }}>
                                                No inactive subscriptions found.
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '1rem' }}>
                                                All your subscriptions are currently active.
                                            </Typography>
                                        </div>
                                    ) : (
                                        <motion.div
                                            variants={containerVariants}
                                            initial="hidden"
                                            animate="visible"
                                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                                        >
                                            {inactiveSubscriptions.map((sub) => {
                                                const coverPhotoUrl = sub.classId && sub.classId.coverPhoto ? `${BASE_URL}${sub.classId.coverPhoto}` : null;
                                                console.log(`Cover Photo URL for inactive subscription ${sub._id}:`, coverPhotoUrl);

                                                return (
                                                    <motion.div
                                                        key={sub._id}
                                                        variants={cardVariants}
                                                        whileHover="hover"
                                                        className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-gray-200 rounded-xl p-5 relative overflow-hidden"
                                                    >
                                                        <div className="absolute right-0 top-0 h-16 w-16">
                                                            <div className="absolute transform rotate-45 bg-red-500 text-center text-white font-medium py-1 right-[-35px] top-[32px] w-[170px] text-base">Inactive</div>
                                                        </div>
                                                        {/* Cover Photo */}
                                                        {sub.classId && sub.classId.coverPhoto ? (
                                                            <div className="w-full h-40 rounded-lg overflow-hidden mb-4 shadow-sm">
                                                                <img
                                                                    src={coverPhotoUrl}
                                                                    alt="Class Cover"
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        console.error(`Failed to load cover photo for inactive subscription ${sub._id}: ${coverPhotoUrl}`);
                                                                        e.target.style.display = 'none';
                                                                    }}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="w-full h-40 rounded-lg bg-gray-200 flex items-center justify-center mb-4 shadow-sm">
                                                                <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem' }}>
                                                                    No Cover Photo
                                                                </Typography>
                                                            </div>
                                                        )}
                                                        <Typography
                                                            variant="h6"
                                                            sx={{
                                                                fontWeight: 600,
                                                                color: '#1a202c',
                                                                mb: 2,
                                                                fontSize: '1.25rem',
                                                                pr: 8,
                                                            }}
                                                        >
                                                            {sub.classId.subject}
                                                        </Typography>
                                                        <div className="flex items-center mb-2">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '1rem' }}>
                                                                <span className="font-medium">${sub.feePaid}</span> monthly
                                                            </Typography>
                                                        </div>
                                                        <div className="flex items-center mb-4">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                            </svg>
                                                            <Tooltip title="View teacher profile" placement="top">
                                                                <Typography
                                                                    variant="body2"
                                                                    sx={{
                                                                        color: '#6b7280',
                                                                        fontSize: '1rem',
                                                                        '&:hover': {
                                                                            color: '#3b82f6',
                                                                            cursor: 'pointer',
                                                                        },
                                                                    }}
                                                                >
                                                                    <span className="font-medium">{sub.classId.teacherId.name}</span>
                                                                </Typography>
                                                            </Tooltip>
                                                        </div>
                                                        <button
                                                            onClick={() => handleReactivate(sub.classId._id)}
                                                            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-300 font-medium flex items-center justify-center shadow-sm group text-base hover:shadow-md"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                            </svg>
                                                            <span>Reactivate Subscription</span>
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                            </svg>
                                                        </button>
                                                    </motion.div>
                                                );
                                            })}
                                        </motion.div>
                                    )}
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ThemeProvider>
    );
};

export default StudentDashboard;