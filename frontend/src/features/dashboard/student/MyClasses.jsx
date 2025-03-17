// frontend/src/features/dashboard/student/MyClasses.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Breadcrumbs, Link as MuiLink, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import StudentSidebar from "../../../components/StudentSidebar/index";
import StudentHeader from "../../../components/StudentHeader/index";

const MyClasses = () => {
    const [classes, setClasses] = useState([]);
    const [inactiveSubscriptions, setInactiveSubscriptions] = useState([]);
    const navigate = useNavigate();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem("userInfo"));
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get("http://localhost:5000/api/subscriptions/my-classes", config);
                setClasses(data);

                // Fetch all subscriptions to identify inactive ones
                const { data: allSubscriptions } = await axios.get("http://localhost:5000/api/subscriptions/payment-history", config);
                const inactive = allSubscriptions.filter(sub => sub.status === 'Inactive');
                setInactiveSubscriptions(inactive);
            } catch (error) {
                console.error("Error fetching classes:", error);
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

                    {/* Active Classes Section */}
                    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">My Active Classes</h2>
                        {classes.length === 0 ? (
                            <p className="text-gray-500 text-center py-6">You are not subscribed to any active classes yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {classes.map((cls) => (
                                    <div key={cls._id} className="bg-blue-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{cls.subject}</h3>
                                        <p className="text-gray-600 text-sm mb-1">Monthly Fee: <span className="font-medium">${cls.monthlyFee}</span></p>
                                        <p className="text-gray-600 text-sm mb-4">Teacher: <span className="font-medium">{cls.teacherId.name}</span></p>
                                        <button onClick={() => viewMaterials(cls._id)} className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 text-sm font-medium">
                                            View Materials
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Inactive Classes Section */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">Inactive Subscriptions</h2>
                        {inactiveSubscriptions.length === 0 ? (
                            <p className="text-gray-500 text-center py-6">No inactive subscriptions found.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {inactiveSubscriptions.map((sub) => (
                                    <div key={sub._id} className="bg-red-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{sub.classId.subject}</h3>
                                        <p className="text-gray-600 text-sm mb-1">Monthly Fee: <span className="font-medium">${sub.feePaid}</span></p>
                                        <p className="text-gray-600 text-sm mb-4">Teacher: <span className="font-medium">{sub.classId.teacherId.name}</span></p>
                                        <button onClick={() => handleReactivate(sub.classId._id)} className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 text-sm font-medium">
                                            Reactivate Subscription
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