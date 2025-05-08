//frontend/src/features/dashboard/student/RefundHistory.jsx
import StudentSidebar from "../../../components/StudentSidebar/index";
import StudentHeader from "../../../components/StudentHeader/index";
import { Breadcrumbs, Link as MuiLink, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

const RefundHistory = () => {
  const [refunds, setRefunds] = useState([]);
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const fetchRefundHistory = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get("http://localhost:5000/api/refunds/my-requests", config);
        setRefunds(data);
      } catch (error) {
        console.error("Error fetching refund history:", error);
      }
    };
    fetchRefundHistory();
  }, []);

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

  const pageTitle =
    pathnames.length > 0
      ? pathnames[pathnames.length - 1].charAt(0).toUpperCase() +
        pathnames[pathnames.length - 1].slice(1)
      : "Dashboard";

  useEffect(() => {
    document.title = `${pageTitle} - Student Dashboard - EduConnect`;
  }, [location, pageTitle]);

  // Function to determine status styling with light colors
  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-50 text-yellow-600 border border-yellow-200 rounded-full px-3 py-1 text-sm font-medium";
      case "approved":
        return "bg-green-50 text-green-600 border border-green-200 rounded-full px-3 py-1 text-sm font-medium";
      case "rejected":
        return "bg-red-50 text-red-600 border border-red-200 rounded-full px-3 py-1 text-sm font-medium";
      default:
        return "bg-gray-50 text-gray-600 border border-gray-200 rounded-full px-3 py-1 text-sm font-medium";
    }
  };

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
                    
                      
                      <div className="p-4 md:p-6 overflow-y-auto "></div>

          {/* Main Content */}
          <div className="pt-[90px] pb-16 px-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
              <Typography variant="h5" gutterBottom className="font-bold text-gray-800">
                Refund History
              </Typography>
              {refunds.length === 0 ? (
                <Typography className="text-gray-400 text-center py-6">
                  No refund requests found.
                </Typography>
              ) : (
                <TableContainer component={Paper} className="mt-4 border border-gray-100 rounded-lg">
                  <Table>
                    <TableHead>
                      <TableRow className="bg-gradient-to-r from-blue-100 to-indigo-100 text-gray-800">
                        <TableCell className="font-semibold text-gray-700 py-3">Refund ID</TableCell>
                        <TableCell className="font-semibold text-gray-700 py-3">Class Name</TableCell>
                        <TableCell className="font-semibold text-gray-700 py-3">Class Fee</TableCell>
                        <TableCell className="font-semibold text-gray-700 py-3">Status</TableCell>
                        <TableCell className="font-semibold text-gray-700 py-3">Request Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {refunds.map((refund, index) => (
                        <TableRow
                          key={refund._id}
                          className={`${
                            index % 2 === 0 ? "bg-gray-50" : "bg-white"
                          } hover:bg-blue-50/50 transition-colors`}
                        >
                          <TableCell className="text-blue-500 font-medium">
                            {refund._id}
                          </TableCell>
                          <TableCell className="text-indigo-500">{refund.classId.subject}</TableCell>
                          <TableCell className="text-green-500 font-semibold">
                            ${refund.classFee}
                          </TableCell>
                          <TableCell>
                            <span className={getStatusStyle(refund.status)}>
                              {refund.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-gray-500">
                            {new Date(refund.requestDate).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundHistory;