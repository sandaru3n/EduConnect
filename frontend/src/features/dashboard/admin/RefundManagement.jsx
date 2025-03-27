import { useState, useEffect } from "react";
import { Breadcrumbs, Link as MuiLink, Typography, Paper, Button } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import AdminSidebar from "../../../components/AdminSidebar/index";
import AdminHeader from "../../../components/AdminHeader/index";
import axios from "axios";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // Icon for Approve
import HighlightOffIcon from '@mui/icons-material/HighlightOff'; // Icon for Reject

const RefundManagement = () => {
  const [refunds, setRefunds] = useState([]);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRefunds = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get("http://localhost:5000/api/refunds/all", config);
        setRefunds(data);
      } catch (error) {
        console.error("Error fetching refunds:", error);
      }
    };
    fetchRefunds();
  }, []);

  const handleStatusUpdate = async (refundId, status) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put("http://localhost:5000/api/refunds/status", { refundId, status }, config);
      alert(`Refund request ${status.toLowerCase()} successfully!`);
      setRefunds(refunds.map(r => r._id === refundId ? { ...r, status } : r));
    } catch (error) {
      console.error("Error updating refund status:", error);
      alert("Failed to update refund status: " + (error.response?.data?.message || "Please try again"));
    }
  };

  const handleViewDetails = (refund) => {
    setSelectedRefund(refund);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRefund(null);
  };

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
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const pathnames = location.pathname.split("/").filter((x) => x);
  const breadcrumbItems = pathnames.map((value, index) => {
    const last = index === pathnames.length - 1;
    const to = `/${pathnames.slice(0, index + 1).join("/")}`;
    const displayName = value.charAt(0).toUpperCase() + value.slice(1);

    return last ? (
      <Typography key={to} color="text.primary" fontWeight="medium">
        {displayName}
      </Typography>
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
    document.title = `${pageTitle} - Admin Panel`;
  }, [location, pageTitle]);

  // Function to determine status styling with light colors
  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-50 text-yellow-600 border border-yellow-200 rounded-full px-2 py-0.5 text-xs font-medium";
      case "approved":
        return "bg-green-50 text-green-600 border border-green-200 rounded-full px-2 py-0.5 text-xs font-medium";
      case "rejected":
        return "bg-red-50 text-red-600 border border-red-200 rounded-full px-2 py-0.5 text-xs font-medium";
      default:
        return "bg-gray-50 text-gray-600 border border-gray-200 rounded-full px-2 py-0.5 text-xs font-medium";
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <AdminHeader
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
          <AdminSidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
        </div>

        <div
          className={`flex-1 transition-all duration-300 ${
            isSidebarCollapsed ? "ml-[60px]" : "ml-[18%] md:ml-[250px]"
          }`}
        >
          <div
            className={`mt-[50px] py-3 px-6 bg-white border-b shadow-sm transition-all duration-300 z-30 fixed top-0 left-0 w-full ${
              isSidebarCollapsed
                ? "ml-[60px] w-[calc(100%-60px)]"
                : "ml-[18%] w-[calc(100%-18%)] md:ml-[250px] md:w-[calc(100%-250px)]"
            }`}
          >
            <Breadcrumbs aria-label="breadcrumb">
              <MuiLink component={Link} to="/admin" underline="hover" color="inherit">
                Admin
              </MuiLink>
              {breadcrumbItems}
            </Breadcrumbs>
          </div>

          <div className="mt-[100px] p-6 md:p-8 overflow-y-auto h-[calc(100vh-100px)]">
            <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
              <Typography variant="h5" gutterBottom className="font-bold text-gray-800">
                Refund Requests
              </Typography>
              {refunds.length === 0 ? (
                <Typography className="text-gray-400 text-center py-6">
                  No refund requests found.
                </Typography>
              ) : (
                <TableContainer component={Paper} className="mt-4 border border-gray-100 rounded-lg">
                  <Table>
                    <TableHead>
                      <TableRow className="bg-gradient-to-r from-purple-100 to-blue-100 text-gray-800">
                        <TableCell className="font-semibold text-gray-700 py-2 px-3 text-xs">Refund ID</TableCell>
                        <TableCell className="font-semibold text-gray-700 py-2 px-3 text-xs">Class Name</TableCell>
                        <TableCell className="font-semibold text-gray-700 py-2 px-3 text-xs">Teacher Name</TableCell>
                        <TableCell className="font-semibold text-gray-700 py-2 px-3 text-xs">Class Fee</TableCell>
                        <TableCell className="font-semibold text-gray-700 py-2 px-3 text-xs">Student Name</TableCell>
                        <TableCell className="font-semibold text-gray-700 py-2 px-3 text-xs">Status</TableCell>
                        <TableCell className="font-semibold text-gray-700 py-2 px-3 text-xs">Request Date</TableCell>
                        <TableCell className="font-semibold text-gray-700 py-2 px-3 text-xs">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {refunds.map((refund, index) => (
                        <TableRow
                          key={refund._id}
                          className={`${
                            index % 2 === 0 ? "bg-gray-50" : "bg-white"
                          } hover:bg-purple-50/50 transition-colors duration-200`}
                        >
                          <TableCell className="text-purple-500 font-medium py-2 px-3 text-xs">
                            {refund._id}
                          </TableCell>
                          <TableCell className="text-blue-500 py-2 px-3 text-xs">
                            {refund.classId.subject}
                          </TableCell>
                          <TableCell className="text-indigo-500 py-2 px-3 text-xs">
                            {refund.classId.teacherId.name}
                          </TableCell>
                          <TableCell className="text-green-500 font-semibold py-2 px-3 text-xs">
                            ${refund.classFee}
                          </TableCell>
                          <TableCell className="text-teal-500 py-2 px-3 text-xs">
                            {refund.studentId.name}
                          </TableCell>
                          <TableCell className="py-2 px-3">
                            <span className={getStatusStyle(refund.status)}>
                              {refund.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-gray-500 py-2 px-3 text-xs">
                            {new Date(refund.requestDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="py-2 px-3 flex gap-1 items-center">
                            {refund.status === "Pending" && (
                              <>
                                <Button
                                  onClick={() => handleStatusUpdate(refund._id, "Approved")}
                                  className="text-green-500 hover:text-green-600 p-1 rounded-full transition-colors duration-200"
                                >
                                  <CheckCircleOutlineIcon fontSize="small" />
                                </Button>
                                <Button
                                  onClick={() => handleStatusUpdate(refund._id, "Rejected")}
                                  className="text-red-500 hover:text-red-600 p-1 rounded-full transition-colors duration-200"
                                >
                                  <HighlightOffIcon fontSize="small" />
                                </Button>
                              </>
                            )}
                            <Button
                              onClick={() => handleViewDetails(refund)}
                              className="text-blue-600 hover:bg-blue-50 px-2 py-0.5 rounded-md text-xs"
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Dialog for Viewing Refund Details */}
              <Dialog open={open} onClose={handleClose} className="rounded-lg">
                <DialogTitle className="bg-gray-50 text-gray-800 font-semibold border-b border-gray-200">
                  Refund Request Details
                </DialogTitle>
                <DialogContent className="p-6 bg-white">
                  {selectedRefund && (
                    <div className="space-y-3">
                      <Typography className="text-gray-700">
                        <strong>Class:</strong> {selectedRefund.classId.subject}
                      </Typography>
                      <Typography className="text-gray-700">
                        <strong>Student:</strong> {selectedRefund.studentId.name}
                      </Typography>
                      <Typography className="text-gray-700">
                        <strong>Fee:</strong> ${selectedRefund.classFee}
                      </Typography>
                      <Typography className="text-gray-700">
                        <strong>Reason:</strong> {selectedRefund.reason}
                      </Typography>
                    </div>
                  )}
                </DialogContent>
                <DialogActions className="bg-gray-50 border-t border-gray-200">
                  <Button
                    onClick={handleClose}
                    className="text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-md"
                  >
                    Close
                  </Button>
                </DialogActions>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundManagement;