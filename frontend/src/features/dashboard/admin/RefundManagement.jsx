import { useState, useEffect } from "react";
import { Breadcrumbs, Link as MuiLink, Typography, Paper, Button, TextField, Select, MenuItem, FormControl, InputLabel, IconButton, Collapse, Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import AdminSidebar from "../../../components/AdminSidebar/index";
import AdminHeader from "../../../components/AdminHeader/index";
import axios from "axios";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // Icon for Approve
import HighlightOffIcon from '@mui/icons-material/HighlightOff'; // Icon for Reject
import FilterListIcon from '@mui/icons-material/FilterList'; // Icon for Filter
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // Icon for Expand/Collapse
import ExpandLessIcon from '@mui/icons-material/ExpandLess'; // Icon for Expand/Collapse
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'; // Icon for Export PDF
import RefreshIcon from '@mui/icons-material/Refresh'; // Icon for Reset Filters
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const RefundManagement = () => {
    const [refunds, setRefunds] = useState([]);
    const [filteredRefunds, setFilteredRefunds] = useState([]);
    const [selectedRefund, setSelectedRefund] = useState(null);
    const [open, setOpen] = useState(false); // For details dialog
    const [filterOpen, setFilterOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false); // For confirmation dialog
    const [confirmAction, setConfirmAction] = useState(null); // Track the action (approve/reject)
    const [confirmRefundId, setConfirmRefundId] = useState(null); // Track the refund ID for confirmation
    const [successMessage, setSuccessMessage] = useState(""); // For success message
    const [successOpen, setSuccessOpen] = useState(false); // For success snackbar
    const location = useLocation();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [loading, setLoading] = useState(true);

    // Filter states
    const [filterTeacherName, setFilterTeacherName] = useState("");
    const [filterStudentName, setFilterStudentName] = useState("");
    const [filterRefundId, setFilterRefundId] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterRequestDate, setFilterRequestDate] = useState("");

    useEffect(() => {
        const fetchRefunds = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem("userInfo"));
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get("http://localhost:5000/api/refunds/all", config);
                setRefunds(data);
                setFilteredRefunds(data);
            } catch (error) {
                console.error("Error fetching refunds:", error);
            }
        };
        fetchRefunds();
    }, []);

    // Apply filters whenever filter states change
    useEffect(() => {
        let filtered = [...refunds];

        if (filterTeacherName) {
            filtered = filtered.filter(refund =>
                refund.classId.teacherId.name.toLowerCase().includes(filterTeacherName.toLowerCase())
            );
        }

        if (filterStudentName) {
            filtered = filtered.filter(refund =>
                refund.studentId.name.toLowerCase().includes(filterStudentName.toLowerCase())
            );
        }

        if (filterRefundId) {
            filtered = filtered.filter(refund =>
                refund._id.toLowerCase().includes(filterRefundId.toLowerCase())
            );
        }

        if (filterStatus) {
            filtered = filtered.filter(refund =>
                refund.status.toLowerCase() === filterStatus.toLowerCase()
            );
        }

        if (filterRequestDate) {
            filtered = filtered.filter(refund =>
                new Date(refund.requestDate).toISOString().split('T')[0] === filterRequestDate
            );
        }

        setFilteredRefunds(filtered);
    }, [filterTeacherName, filterStudentName, filterRefundId, filterStatus, filterRequestDate, refunds]);

    // Reset all filters
    const resetFilters = () => {
        setFilterTeacherName("");
        setFilterStudentName("");
        setFilterRefundId("");
        setFilterStatus("");
        setFilterRequestDate("");
        setFilteredRefunds(refunds); // Reset filtered data to original data
    };

    const handleStatusUpdate = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            await axios.put("http://localhost:5000/api/refunds/status", { refundId: confirmRefundId, status: confirmAction }, config);
            setSuccessMessage(`Refund request ${confirmAction.toLowerCase()} successfully!`);
            setSuccessOpen(true);
            setRefunds(refunds.map(r => r._id === confirmRefundId ? { ...r, status: confirmAction } : r));
            setFilteredRefunds(filteredRefunds.map(r => r._id === confirmRefundId ? { ...r, status: confirmAction } : r));
        } catch (error) {
            console.error("Error updating refund status:", error);
            setSuccessMessage("Failed to update refund status: " + (error.response?.data?.message || "Please try again"));
            setSuccessOpen(true);
        } finally {
            setConfirmOpen(false);
            setConfirmAction(null);
            setConfirmRefundId(null);
        }
    };

    const handleConfirmAction = (refundId, action) => {
        setConfirmRefundId(refundId);
        setConfirmAction(action);
        setConfirmOpen(true);
    };

    const handleViewDetails = (refund) => {
        console.log("Selected Refund Proof:", refund.proof);
        setSelectedRefund(refund);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedRefund(null);
    };

    const handleConfirmClose = () => {
        setConfirmOpen(false);
        setConfirmAction(null);
        setConfirmRefundId(null);
    };

    const handleSuccessClose = () => {
        setSuccessOpen(false);
        setSuccessMessage("");
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

    // Function to export filtered refunds as PDF
    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Refund Requests Report", 14, 22);

        // Define table columns
        const columns = [
            { header: "Refund ID", dataKey: "_id" },
            { header: "Class Name", dataKey: "className" },
            { header: "Teacher Name", dataKey: "teacherName" },
            { header: "Class Fee", dataKey: "classFee" },
            { header: "Student Name", dataKey: "studentName" },
            { header: "Status", dataKey: "status" },
            { header: "Request Date", dataKey: "requestDate" }
        ];

        // Prepare table data
        const tableData = filteredRefunds.map(refund => ({
            _id: refund._id,
            className: refund.classId.subject,
            teacherName: refund.classId.teacherId.name,
            classFee: `$${refund.classFee}`,
            studentName: refund.studentId.name,
            status: refund.status,
            requestDate: new Date(refund.requestDate).toLocaleDateString()
        }));

        // Generate table using jsPDF-autoTable
        doc.autoTable({
            columns: columns,
            body: tableData,
            startY: 30,
            theme: 'striped',
            headStyles: { fillColor: [100, 116, 139] }, // Slate-600 color
            styles: { fontSize: 8, cellPadding: 2 },
            margin: { top: 30 }
        });

        // Add footer with timestamp
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.text(`Page ${i} of ${pageCount}`, 14, doc.internal.pageSize.height - 10);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, doc.internal.pageSize.width - 70, doc.internal.pageSize.height - 10);
        }

        // Download the PDF
        doc.save("refund_requests_report.pdf");
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
                            {breadcrumbItems}
                        </Breadcrumbs>
                    </div>

                    <div className="mt-[100px] p-6 md:p-8 overflow-y-auto h-[calc(100vh-100px)]">
                        <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <Typography variant="h5" className="font-bold text-gray-800">
                                    Refund Requests
                                </Typography>
                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={exportToPDF}
                                        startIcon={<PictureAsPdfIcon />}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm"
                                    >
                                        Export as PDF
                                    </Button>
                                    <IconButton onClick={() => setFilterOpen(!filterOpen)} className="text-gray-600 hover:bg-gray-100">
                                        <FilterListIcon />
                                        {filterOpen ? <ExpandLessIcon className="ml-1" /> : <ExpandMoreIcon className="ml-1" />}
                                    </IconButton>
                                </div>
                            </div>

                            {/* Modern Filter Panel */}
                            <Collapse in={filterOpen}>
                                <div className="bg-gray-50 p-4 rounded-lg shadow-inner mb-6 border border-gray-100">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                        <TextField
                                            label="Teacher Name"
                                            value={filterTeacherName}
                                            onChange={(e) => setFilterTeacherName(e.target.value)}
                                            variant="outlined"
                                            size="small"
                                            className="bg-white"
                                        />
                                        <TextField
                                            label="Student Name"
                                            value={filterStudentName}
                                            onChange={(e) => setFilterStudentName(e.target.value)}
                                            variant="outlined"
                                            size="small"
                                            className="bg-white"
                                        />
                                        <TextField
                                            label="Refund ID"
                                            value={filterRefundId}
                                            onChange={(e) => setFilterRefundId(e.target.value)}
                                            variant="outlined"
                                            size="small"
                                            className="bg-white"
                                        />
                                        <FormControl variant="outlined" size="small" className="bg-white">
                                            <InputLabel>Status</InputLabel>
                                            <Select
                                                value={filterStatus}
                                                onChange={(e) => setFilterStatus(e.target.value)}
                                                label="Status"
                                            >
                                                <MenuItem value="">All</MenuItem>
                                                <MenuItem value="Pending">Pending</MenuItem>
                                                <MenuItem value="Approved">Approved</MenuItem>
                                                <MenuItem value="Rejected">Rejected</MenuItem>
                                            </Select>
                                        </FormControl>
                                        <TextField
                                            label="Request Date"
                                            type="date"
                                            value={filterRequestDate}
                                            onChange={(e) => setFilterRequestDate(e.target.value)}
                                            variant="outlined"
                                            size="small"
                                            className="bg-white"
                                            InputLabelProps={{ shrink: true }}
                                        />
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <Button
                                            onClick={resetFilters}
                                            startIcon={<RefreshIcon />}
                                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm"
                                        >
                                            Reset Filters
                                        </Button>
                                    </div>
                                </div>
                            </Collapse>

                            {filteredRefunds.length === 0 ? (
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
                                            {filteredRefunds.map((refund, index) => (
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
                                                                    onClick={() => handleConfirmAction(refund._id, "Approved")}
                                                                    className="text-green-500 hover:text-green-600 p-1 rounded-full transition-colors duration-200"
                                                                >
                                                                    <CheckCircleOutlineIcon fontSize="small" />
                                                                </Button>
                                                                <Button
                                                                    onClick={() => handleConfirmAction(refund._id, "Rejected")}
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
                                            {selectedRefund.proof ? (
                                                <div className="mt-4">
                                                    <Typography className="text-gray-700 mb-2">
                                                        <strong>Proof:</strong>
                                                    </Typography>
                                                    <img
                                                        src={`http://localhost:5000${selectedRefund.proof}`}
                                                        alt="Refund Proof"
                                                        className="max-w-full h-auto rounded-lg border border-gray-200"
                                                        style={{ maxHeight: '300px' }}
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'block';
                                                        }}
                                                    />
                                                    <Typography
                                                        className="text-red-500 mt-2"
                                                        style={{ display: 'none' }}
                                                    >
                                                        Failed to load proof image.
                                                    </Typography>
                                                </div>
                                            ) : (
                                                <Typography className="text-gray-500 mt-2">
                                                    No proof uploaded.
                                                </Typography>
                                            )}
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

                            {/* Confirmation Dialog for Approve/Reject */}
                            <Dialog open={confirmOpen} onClose={handleConfirmClose} className="rounded-lg">
                                <DialogTitle className="bg-gray-50 text-gray-800 font-semibold border-b border-gray-200">
                                    Confirm {confirmAction} Action
                                </DialogTitle>
                                <DialogContent className="p-6 bg-white">
                                    <Typography className="text-gray-700">
                                        Are you sure you want to {confirmAction?.toLowerCase()} this refund request?
                                    </Typography>
                                </DialogContent>
                                <DialogActions className="bg-gray-50 border-t border-gray-200">
                                    <Button
                                        onClick={handleConfirmClose}
                                        className="text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-md"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleStatusUpdate}
                                        className={`${
                                            confirmAction === "Approved"
                                                ? "bg-green-600 hover:bg-green-700"
                                                : "bg-red-600 hover:bg-red-700"
                                        } text-white px-4 py-2 rounded-md`}
                                    >
                                        Confirm
                                    </Button>
                                </DialogActions>
                            </Dialog>

                            {/* Success Snackbar */}
                            <Snackbar
                                open={successOpen}
                                autoHideDuration={3000}
                                onClose={handleSuccessClose}
                                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                            >
                                <Alert
                                    onClose={handleSuccessClose}
                                    severity={successMessage.includes("Failed") ? "error" : "success"}
                                    sx={{ width: '100%' }}
                                >
                                    {successMessage}
                                </Alert>
                            </Snackbar>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RefundManagement;