//frontend/src/features/dashboard/student/StudentDashboard.jsx

import StudentSidebar from "../../../components/StudentSidebar/index";
import StudentHeader from "../../../components/StudentHeader/index";
import { Breadcrumbs, Link as MuiLink, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";


import axios from "axios";
import PaymentModal from "../../../components/PaymentModal";
import { HiUserCircle, HiCurrencyDollar, HiChevronDown, HiChevronUp } from "react-icons/hi";

const ActiveTeachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [classes, setClasses] = useState([]);
    const [classesLoading, setClassesLoading] = useState(false);
    const [classesError, setClassesError] = useState(null);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState(null);
    const location = useLocation();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

     // Fetch active teachers on mount
     useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem("userInfo"));
                if (!userInfo || !userInfo.token) {
                    throw new Error("User not authenticated");
                }
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get("http://localhost:5000/api/student/teachers", config);
                setTeachers(data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to fetch teachers");
                setLoading(false);
            }
        };
        fetchTeachers();
    }, []);

    // Fetch classes for a specific teacher
    const fetchClassesForTeacher = async (teacherId) => {
        setClassesLoading(true);
        setClassesError(null);
        try {
            const { data } = await axios.get(`http://localhost:5000/api/classes/teacher/${teacherId}`);
            setClasses(data);
            setSelectedTeacher(teacherId);
        } catch (err) {
            setClassesError(err.response?.data?.message || "Failed to fetch classes");
        } finally {
            setClassesLoading(false);
        }
    };

    // Toggle classes visibility
    const handleSeeClasses = (teacherId) => {
        if (selectedTeacher === teacherId) {
            setSelectedTeacher(null);
            setClasses([]);
        } else {
            fetchClassesForTeacher(teacherId);
        }
    };

    // Open payment modal
    const handlePayClassFee = (classId) => {
        setSelectedClassId(classId);
        setPaymentModalOpen(true);
    };

    // Handle payment submission
    const handlePaymentSubmit = async (paymentData) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.post(
                "http://localhost:5000/api/payments/subscribe",
                {
                    classId: paymentData.classId,
                    cardNumber: paymentData.cardNumber,
                    expiryDate: paymentData.expiryDate,
                    cvv: paymentData.cvv,
                },
                config
            );
            alert("Subscription successful!");
            setPaymentModalOpen(false); // Close modal on success
        } catch (err) {
            throw new Error(err.response?.data?.message || "Payment failed");
        }
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
                              {/* Breadcrumbs */}
                          <div
                            className={`mt-[50px] py-2 px-4 md:px-6 bg-gray-100 border-b transition-all duration-300 z-30 fixed top-0 left-0 w-full ${
                              isSidebarCollapsed
                                ? "ml-[60px] w-[calc(100%-60px)]"
                                : "ml-[18%] w-[calc(100%-18%)] md:ml-[250px] md:w-[calc(100%-250px)]"
                            }`}
                          >
                            <Breadcrumbs aria-label="breadcrumb">
                              {breadcrumbItems}
                            </Breadcrumbs>
                            </div></div>
                          
                            
                            <div className="mt-[90px] p-4 md:p-6 overflow-y-auto h-[calc(100vh-90px)]">
                    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
            <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-blue-900 mb-2 flex items-center justify-left gap-2">
                    
                    Active Teachers
                </h2>
                
            </div>

            {loading ? (
                <div className="flex justify-center py-4">
                    <svg
                        className="animate-spin h-8 w-8 text-blue-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                    </svg>
                </div>
            ) : error ? (
                <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center">
                    {error}
                </div>
            ) : teachers.length === 0 ? (
                <div className="text-center p-6 bg-white rounded-lg border border-blue-100">
                    <p className="text-blue-600">No teachers available</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {teachers.map((teacher) => (
                        <div
                            key={teacher._id}
                            className="bg-white rounded-xl shadow-sm border border-blue-100 hover:border-blue-200 transition-all duration-300"
                        >
                            <div className="p-6 flex justify-between items-start">
                                <div className="flex items-start gap-4">
                                    <HiUserCircle className="w-12 h-12 text-black-400" />
                                    <div>
                                        <h3 className="text-xl font-semibold text-blue-900">{teacher.name}</h3>
                                        <p className="text-blue-600 text-base mt-1">{teacher.email}</p>
                                        {teacher.qualifications && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {teacher.qualifications.map((qual, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1 bg-blue-50 text-blue-800 text-sm rounded-full"
                                                    >
                                                        {qual}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleSeeClasses(teacher._id)}
                                    className="bg-blue-600 text-white py-2 px-5 rounded-lg hover:bg-blue-700 transition-all duration-300 font-semibold flex items-center gap-2"
                                >
                                    {selectedTeacher === teacher._id ? (
                                        <>
                                            <span>Collapse</span>
                                            <HiChevronUp className="w-4 h-4" />
                                        </>
                                    ) : (
                                        <>
                                            <span>View Classes</span>
                                            <HiChevronDown className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>

                            {selectedTeacher === teacher._id && (
                                <div className="border-t border-blue-50 p-6 bg-blue-50/30">
                                    {classesLoading ? (
                                        <div className="flex justify-center py-4">
                                            <svg
                                                className="animate-spin h-8 w-8 text-blue-600"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                            >
                                                <circle
                                                    className="opacity-25"
                                                    cx="12"
                                                    cy="12"
                                                    r="10"
                                                    stroke="currentColor"
                                                    strokeWidth="4"
                                                />
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                                />
                                            </svg>
                                        </div>
                                    ) : classesError ? (
                                        <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                            {classesError}
                                        </div>
                                    ) : classes.length === 0 ? (
                                        <div className="text-center p-6 bg-white rounded-lg border border-blue-100">
                                            <p className="text-blue-600">No classes available</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {classes.map((cls) => (
                                                <div
                                                    key={cls._id}
                                                    className="bg-white rounded-lg border border-blue-100 p-5 hover:border-blue-200 transition-all duration-300"
                                                >
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="text-lg font-semibold text-blue-900">
                                                                {cls.subject}
                                                            </h4>
                                                            <p className="text-blue-600 text-sm mt-1">
                                                                {cls.description || "Comprehensive course curriculum"}
                                                            </p>
                                                        </div>
                                                        
                                                    </div>

                                                    <div className="mt-4 flex justify-between items-center">
                                                        <div className="flex items-center gap-2 text-blue-600">
                                                            <HiCurrencyDollar className="w-5 h-5" />
                                                            <span className="font-semibold">
                                                                USD {cls.monthlyFee}/mo
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() => handlePayClassFee(cls._id)}
                                                            className="bg-blue-100 text-blue-800 px-4 py-2.5 rounded-full hover:bg-blue-200 hover:text-blue-900 transition-all duration-300 text-sm whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 min-w-[120px] text-center"
                                                        >
                                                            Pay Now
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <PaymentModal
                open={paymentModalOpen}
                onClose={() => setPaymentModalOpen(false)}
                onSubmit={handlePaymentSubmit}
                classId={selectedClassId}
                theme="blue"
            />
        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActiveTeachers;