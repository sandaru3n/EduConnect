// frontend/src/features/dashboard/teacher/ViewAllClasses.jsx
import { useState, useEffect } from "react";
import { Breadcrumbs, Link as MuiLink, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import StudentSidebar from "../../../components/TeacherSidebar/index";
import StudentHeader from "../../../components/TeacherHeader/index";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ViewAllClasses = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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


  

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  useEffect(() => {
    const fetchClasses = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            const { data } = await axios.get(
                "http://localhost:5000/api/teacher/classes",
                config
            );
            
            setClasses(data);
            setLoading(false);
        } catch (error) {
            setError(error.response?.data?.message || "Error fetching classes");
            setLoading(false);
        }
    };

    fetchClasses();
}, []);

const handleEdit = (classId) => {
    navigate(`/teacher/classes/${classId}/update`);
};

if (loading) return <div className="text-center text-indigo-600 font-semibold">Loading...</div>;
if (error) return (
    <div className="text-red-600 bg-red-100 p-3 rounded-md text-center shadow-sm">
        {error}
    </div>
);

 

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
      <MuiLink
        key={to}
        component={Link}
        to={to}
        underline="hover"
        color="inherit"
      >
        {displayName}
      </MuiLink>
    );
  });

  

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
            <MuiLink component={Link} to="/student" underline="hover" color="inherit">
              Student
            </MuiLink>
            {breadcrumbItems}
          </Breadcrumbs>
          </div></div>
        
          
          <div className="mt-[90px] p-4 md:p-6 overflow-y-auto h-[calc(100vh-90px)]">
          <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-gray-100 to-teal-50 p-6">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-extrabold text-center text-indigo-700 mb-8 tracking-tight">
                    My Classes
                </h2>
                {classes.length === 0 ? (
                    <p className="text-gray-600 text-center text-lg">No classes found</p>
                ) : (
                    <ul className="space-y-6">
                        {classes.map((classItem) => (
                            <li
                                key={classItem._id}
                                className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300"
                            >
                                <h3 className="text-xl font-semibold text-indigo-900 mb-2">
                                    {classItem.subject}
                                </h3>
                                <p className="text-teal-700 font-medium">
                                    Fee: ${classItem.monthlyFee}
                                </p>
                                <p className="text-gray-600 italic mt-1">
                                    {classItem.description}
                                </p>
                                <p className={`mt-2 font-medium ${classItem.isActive ? "text-green-600" : "text-red-600"}`}>
                                    Status: {classItem.isActive ? "Active" : "Inactive"}
                                </p>
                                <button
                                    onClick={() => handleEdit(classItem._id)}
                                    className="mt-4 bg-gradient-to-r from-green-500 to-teal-500 text-white py-2 px-4 rounded-md hover:from-green-600 hover:to-teal-600 transition-all duration-300 font-semibold shadow-md transform hover:scale-105"
                                >
                                    Edit Details
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAllClasses;