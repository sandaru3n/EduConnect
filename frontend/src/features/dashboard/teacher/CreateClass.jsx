import { useState, useEffect } from "react";
import { Breadcrumbs, Link as MuiLink, Typography, IconButton } from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import TeacherSidebar from "../../../components/TeacherSidebar/index";
import TeacherHeader from "../../../components/TeacherHeader/index";
import axios from "axios";
import { Clear as ClearIcon } from "@mui/icons-material";

const CreateClass = () => {
    const [subject, setSubject] = useState("");
    const [monthlyFee, setMonthlyFee] = useState("");
    const [description, setDescription] = useState("");
    const [coverPhoto, setCoverPhoto] = useState(null);
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
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
                "http://localhost:5000/api/classes/create", // Correct endpoint
                formData,
                config
            );

            navigate("/teacher/dashboard");
        } catch (error) {
            setError(error.response?.data?.message || "Error creating class");
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
                    <div
                        className={`mt-[50px] py-2 px-4 md:px-6 bg-gray-100 border-b fixed top-0 w-full z-30 transition-all duration-300 ${
                            isSidebarCollapsed 
                                ? "ml-[60px] w-[calc(100%-60px)]" 
                                : "ml-[18%] w-[calc(100%-18%)] md:ml-[250px] md:w-[calc(100%-250px)]"
                        }`}
                    >
                        <Breadcrumbs aria-label="breadcrumb">
                            <MuiLink component={Link} to="/teacher" underline="hover" color="inherit">
                                Teacher
                            </MuiLink>
                            {breadcrumbItems}
                        </Breadcrumbs>
                    </div>
                    
                    <div className="mt-[90px] p-4 md:p-6 overflow-y-auto h-[calc(100vh-90px)]">
                        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-gray-100 to-teal-50 flex items-center justify-center p-4">
                            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
                                <h2 className="text-3xl font-extrabold text-center text-indigo-700 mb-6 tracking-tight">
                                    Create New Class
                                </h2>
                                {error && (
                                    <p className="text-red-600 bg-red-100 p-3 rounded-md text-center mb-6 shadow-sm">
                                        {error}
                                    </p>
                                )}
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <input
                                            type="text"
                                            placeholder="Subject"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            required
                                            className={`w-full px-4 py-2 border rounded-md bg-indigo-50 text-indigo-900 placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 ${
                                                validationErrors.subject ? 'border-red-300' : 'border-indigo-300'
                                            }`}
                                        />
                                        {validationErrors.subject && (
                                            <p className="text-red-500 text-sm mt-1">{validationErrors.subject}</p>
                                        )}
                                    </div>
                                    <div>
                                        <input
                                            type="number"
                                            placeholder="Monthly Fee (LKR)"
                                            value={monthlyFee}
                                            onChange={(e) => setMonthlyFee(e.target.value)}
                                            required
                                            className={`w-full px-4 py-2 border rounded-md bg-teal-50 text-teal-900 placeholder-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 ${
                                                validationErrors.monthlyFee ? 'border-red-300' : 'border-teal-300'
                                            }`}
                                        />
                                        {validationErrors.monthlyFee && (
                                            <p className="text-red-500 text-sm mt-1">{validationErrors.monthlyFee}</p>
                                        )}
                                    </div>
                                    <div>
                                        <textarea
                                            placeholder="Class Description"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className={`w-full px-4 py-2 border rounded-md bg-purple-50 text-purple-900 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent h-32 resize-none transition-all duration-300 ${
                                                validationErrors.description ? 'border-red-300' : 'border-purple-300'
                                            }`}
                                        />
                                        {validationErrors.description && (
                                            <p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Upload Cover Photo (JPEG, PNG, max 5MB)
                                        </label>
                                        <div className="flex items-center">
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png"
                                                onChange={handleFileChange}
                                                className="w-full px-4 py-2 border rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                                            />
                                            {coverPhoto && (
                                                <IconButton onClick={handleRemoveCoverPhoto} color="error">
                                                    <ClearIcon />
                                                </IconButton>
                                            )}
                                        </div>
                                        {validationErrors.coverPhoto && (
                                            <p className="text-red-500 text-sm mt-1">{validationErrors.coverPhoto}</p>
                                        )}
                                    </div>
                                    {coverPhoto && (
                                        <div className="mt-2 text-center">
                                            <p className="text-sm font-medium text-gray-700 mb-1">Cover Photo Preview:</p>
                                            <img
                                                src={URL.createObjectURL(coverPhoto)}
                                                alt="Cover Photo Preview"
                                                className="max-w-full h-auto rounded-md shadow-sm"
                                                style={{ maxHeight: "200px" }}
                                            />
                                        </div>
                                    )}
                                    <button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-md hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-md transform hover:scale-105"
                                    >
                                        Create Class
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateClass;