import { useState, useEffect } from "react";
import { Breadcrumbs, Link as MuiLink, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import TeacherSidebar from "../../../components/TeacherSidebar/index";
import TeacherHeader from "../../../components/TeacherHeader/index";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const CreateClass = () => {
    const [subject, setSubject] = useState("");
    const [monthlyFee, setMonthlyFee] = useState("");
    const [description, setDescription] = useState("");
    const [coverPhoto, setCoverPhoto] = useState(null);
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const [notification, setNotification] = useState({ message: "", type: "" });
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    // Validation function
    const validateForm = () => {
        const errors = {};

        // Subject validation
        if (!subject.trim()) {
            errors.subject = "Subject is required";
        } else if (subject.length < 2) {
            errors.subject = "Subject must be at least 2 characters long";
        } else if (subject.length > 50) {
            errors.subject = "Subject must be less than 50 characters";
        }

        // Monthly fee validation
        if (!monthlyFee) {
            errors.monthlyFee = "Monthly fee is required";
        } else if (isNaN(monthlyFee) || Number(monthlyFee) <= 0) {
            errors.monthlyFee = "Monthly fee must be a positive number";
        } else if (Number(monthlyFee) > 10000) {
            errors.monthlyFee = "Monthly fee cannot exceed $10,000";
        }

        // Description validation (optional field)
        if (description && description.length > 500) {
            errors.description = "Description must be less than 500 characters";
        }

        // Cover photo validation (optional field)
        if (coverPhoto) {
            const allowedTypes = ['image/jpeg', 'image/png'];
            if (!allowedTypes.includes(coverPhoto.type)) {
                errors.coverPhoto = "Cover photo must be a JPEG or PNG file";
            } else if (coverPhoto.size > 5 * 1024 * 1024) { // 5MB limit
                errors.coverPhoto = "Cover photo must be less than 5MB";
            }
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Run validation before submission
        if (!validateForm()) {
            return;
        }

        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                    "Content-Type": "multipart/form-data"
                },
            };

            const formData = new FormData();
            formData.append("subject", subject);
            formData.append("monthlyFee", Number(monthlyFee));
            formData.append("description", description);
            if (coverPhoto) {
                formData.append("coverPhoto", coverPhoto);
            }

            await axios.post(
                "http://localhost:5000/api/classes/create",
                formData,
                config
            );

            setNotification({ message: "Class created successfully! Redirecting...", type: "success" });
            setTimeout(() => navigate("/teacher/classses/view-all"), 1500);
        } catch (error) {
            setNotification({
                message: error.response?.data?.message || "Error creating class",
                type: "error",
            });
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setCoverPhoto(file);
    };

    const handleRemoveCoverPhoto = () => {
        setCoverPhoto(null);
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
        document.title = `TeacherDashboard - EduConnect`;
    }, [location, pageTitle]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100">
            {/* Notification */}
            <AnimatePresence>
                {notification.message && (
                    <motion.div
                        initial={{ opacity: 0, x: "100%" }}
                        animate={{ opacity: 0.9, x: 16 }}
                        exit={{ opacity: 0, x: "100%" }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className={`fixed top-4 right-0 px-4 py-2 rounded-l-md shadow-lg text-white text-xs font-medium z-50 ${
                            notification.type === "success" ? "bg-green-500" : "bg-red-500"
                        }`}
                    >
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>

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
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow-xl space-y-6"
                        >
                            <h2 className="text-3xl font-extrabold text-center text-indigo-600 tracking-tight">
                                Create New Class
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Class Details Section */}
                                <div>
                                    <h3 className="text-base font-semibold text-gray-800 mb-2">Class Details</h3>
                                    <div className="space-y-4">
                                        {/* Subject */}
                                        <div>
                                            <input
                                                type="text"
                                                placeholder="Subject"
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                                required
                                                className={`h-10 w-full border rounded-lg shadow-sm px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ${
                                                    validationErrors.subject ? "border-red-500" : "border-gray-200"
                                                }`}
                                            />
                                            {validationErrors.subject && (
                                                <p className="text-red-500 text-xs mt-1">{validationErrors.subject}</p>
                                            )}
                                        </div>

                                        {/* Monthly Fee */}
                                        <div>
                                            <input
                                                type="number"
                                                placeholder="Monthly Fee ($)"
                                                value={monthlyFee}
                                                onChange={(e) => setMonthlyFee(e.target.value)}
                                                required
                                                className={`h-10 w-full border rounded-lg shadow-sm px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ${
                                                    validationErrors.monthlyFee ? "border-red-500" : "border-gray-200"
                                                }`}
                                            />
                                            {validationErrors.monthlyFee && (
                                                <p className="text-red-500 text-xs mt-1">{validationErrors.monthlyFee}</p>
                                            )}
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <textarea
                                                placeholder="Class Description (Optional)"
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                className={`h-24 w-full border rounded-lg shadow-sm px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 resize-none ${
                                                    validationErrors.description ? "border-red-500" : "border-gray-200"
                                                }`}
                                            />
                                            {validationErrors.description && (
                                                <p className="text-red-500 text-xs mt-1">{validationErrors.description}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Cover Photo Section */}
                                <div>
                                    <h3 className="text-base font-semibold text-gray-800 mb-2">Cover Photo (Optional)</h3>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png"
                                            onChange={handleFileChange}
                                            className="h-10 w-full border rounded-lg shadow-sm px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                                        />
                                        {coverPhoto && (
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                type="button"
                                                onClick={handleRemoveCoverPhoto}
                                                className="absolute right-2 top-2 text-red-500 hover:text-red-700"
                                            >
                                                <svg
                                                    className="w-5 h-5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M6 18L18 6M6 6l12 12"
                                                    />
                                                </svg>
                                            </motion.button>
                                        )}
                                    </div>
                                    {validationErrors.coverPhoto && (
                                        <p className="text-red-500 text-xs mt-1">{validationErrors.coverPhoto}</p>
                                    )}
                                    {coverPhoto && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="mt-2"
                                        >
                                            <p className="text-sm font-medium text-gray-700 mb-1">Cover Photo Preview:</p>
                                            <img
                                                src={URL.createObjectURL(coverPhoto)}
                                                alt="Cover Photo Preview"
                                                className="w-full h-40 object-cover rounded-lg shadow-sm"
                                            />
                                        </motion.div>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="submit"
                                    className="w-full py-2 px-4 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 shadow-md"
                                >
                                    Create Class
                                </motion.button>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateClass;