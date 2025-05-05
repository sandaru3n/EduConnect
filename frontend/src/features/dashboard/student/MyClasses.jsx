//frontend/src/features/dashboard/student/MyClasses.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Breadcrumbs, Link as MuiLink, Typography, Skeleton, Tooltip } from "@mui/material";
import { Link } from "react-router-dom";
import StudentSidebar from "../../../components/StudentSidebar/index";
import StudentHeader from "../../../components/StudentHeader/index";
import { motion } from "framer-motion";

// Define the base URL for the backend (consistent with PaymentForm.jsx)
const BASE_URL = 'http://localhost:5000';

const MyClasses = () => {
    const [classes, setClasses] = useState([]);
    const [inactiveSubscriptions, setInactiveSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const fetchClasses = async () => {
            setLoading(true);
            try {
                const userInfo = JSON.parse(localStorage.getItem("userInfo"));
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get(`${BASE_URL}/api/subscriptions/my-classes`, config);
                console.log("Active Classes Data:", data); // Log active classes data
                setClasses(data);

                // Fetch all subscriptions to identify inactive ones
                const { data: allSubscriptions } = await axios.get(`${BASE_URL}/api/subscriptions/payment-history`, config);
                console.log("All Subscriptions Data:", allSubscriptions); // Log all subscriptions data
                const inactive = allSubscriptions.filter(sub => sub.status === 'Inactive');
                console.log("Inactive Subscriptions:", inactive); // Log filtered inactive subscriptions
                setInactiveSubscriptions(inactive);
            } catch (error) {
                console.error("Error fetching classes:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchClasses();
    }, []);

    const viewMaterials = (classId) => {
        navigate(`/student/dashboard/my-classes/${classId}/materials`);
    };

    const handleReactivate = (classId) => {
        // Redirect to payment page with classId
        navigate(`/student/dashboard/subscribe/${classId}`);
    };

    // Sidebar logic (unchanged)
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
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <StudentHeader isSidebarCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} isMobile={isMobile} />
            <div className="flex flex-1">
                <div className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 bg-[#fff] border-r border-[rgba(0,0,0,0.1)] ${isSidebarCollapsed ? "w-16" : "w-64"} ${isMobile ? "md:w-64" : ""}`}>
                    <StudentSidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
                </div>
                <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? "ml-16" : "ml-64"} ${isMobile ? "md:ml-64" : ""} pt-16 md:pt-16 p-4 md:p-6`}>
                    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                        <Breadcrumbs aria-label="breadcrumb" className="text-sm">
                            <MuiLink component={Link} to="/student" underline="hover" color="inherit">Student</MuiLink>
                            <Typography color="text.primary">My Classes</Typography>
                        </Breadcrumbs>
                    </div>

                    {/* Page Title */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-6"
                    >
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">My Classes</h1>
                        <p className="text-gray-600 mt-2">Manage your active and inactive class subscriptions</p>
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
                            <h2 className="text-2xl font-bold text-gray-900">Active Classes</h2>
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
                                <p className="text-gray-700 text-lg mb-2">You are not subscribed to any active classes yet.</p>
                                <p className="text-gray-500 mb-4">Browse available classes to start your learning journey.</p>
                                <button
                                    onClick={() => navigate('/student/dashboard/browse-classes')}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 font-medium inline-flex items-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                                            <div className="absolute transform rotate-45 bg-green-500 text-center text-white font-semibold py-1 right-[-35px] top-[32px] w-[170px]">Active</div>
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
                                                <Typography variant="body1" color="text.secondary">
                                                    No Cover Photo
                                                </Typography>
                                            </div>
                                        )}
                                        <h3 className="text-xl font-bold text-gray-900 mb-3 pr-8">{cls.subject}</h3>
                                        <div className="flex items-center mb-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <p className="text-gray-700">
                                                <span className="font-medium">${cls.monthlyFee}</span> monthly
                                            </p>
                                        </div>
                                        <div className="flex items-center mb-4">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <Tooltip title="View teacher profile" placement="top">
                                                <p className="text-gray-700 hover:text-indigo-600 cursor-pointer">
                                                    <span className="font-medium">{cls.teacherId.name}</span>
                                                </p>
                                            </Tooltip>
                                        </div>
                                        <button
                                            onClick={() => viewMaterials(cls._id)}
                                            className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 text-sm font-medium flex items-center justify-center group"
                                        >
                                            <span>View Materials</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                            <h2 className="text-2xl font-bold text-gray-900">Inactive Subscriptions</h2>
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
                                <p className="text-gray-700 text-lg">No inactive subscriptions found.</p>
                                <p className="text-gray-500">All your subscriptions are currently active.</p>
                            </div>
                        ) : (
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {inactiveSubscriptions.map((sub) => {
                                    // Log the cover photo URL to debug
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
                                                <div className="absolute transform rotate-45 bg-red-500 text-center text-white font-semibold py-1 right-[-35px] top-[32px] w-[170px]">Inactive</div>
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
                                                    <Typography variant="body1" color="text.secondary">
                                                        No Cover Photo
                                                    </Typography>
                                                </div>
                                            )}
                                            <h3 className="text-xl font-bold text-gray-900 mb-3 pr-8">{sub.classId.subject}</h3>
                                            <div className="flex items-center mb-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <p className="text-gray-700">
                                                    <span className="font-medium">${sub.feePaid}</span> monthly
                                                </p>
                                            </div>
                                            <div className="flex items-center mb-4">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                <Tooltip title="View teacher profile" placement="top">
                                                    <p className="text-gray-700 hover:text-indigo-600 cursor-pointer">
                                                        <span className="font-medium">{sub.classId.teacherId.name}</span>
                                                    </p>
                                                </Tooltip>
                                            </div>
                                            <button
                                                onClick={() => handleReactivate(sub.classId._id)}
                                                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 text-sm font-medium flex items-center justify-center shadow-sm group"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                                <span>Reactivate Subscription</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    );
};

export default MyClasses;