import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  TextField,
  Grid,
  Button,
  Box,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  TablePagination,
  InputAdornment
} from "@mui/material";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import StudentSidebar from "../../../components/StudentSidebar/index";
import StudentHeader from "../../../components/StudentHeader/index";
import { Search, Person, CalendarToday } from '@mui/icons-material';

const PaymentHistoryDash = () => {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [filters, setFilters] = useState({
    className: "",
    teacherName: "",
    paymentDate: ""
  });
  const [openReceiptDialog, setOpenReceiptDialog] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5); // Limit to 5 rows per page

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get("http://localhost:5000/api/auth/subscriptions/payment-history", config);
        setPayments(data);
        setFilteredPayments(data);
      } catch (error) {
        console.error("Error fetching payment history:", error);
      }
    };

    const handleResize = () => {
      const mobileView = window.innerWidth <= 768;
      setIsMobile(mobileView);
      setIsSidebarCollapsed(mobileView);
    };

    fetchPaymentHistory();
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...payments];

    if (filters.className) {
      filtered = filtered.filter(payment => 
        payment.classId.subject.toLowerCase().includes(filters.className.toLowerCase())
      );
    }

    if (filters.teacherName) {
      filtered = filtered.filter(payment => 
        payment.classId.teacherId.name.toLowerCase().includes(filters.teacherName.toLowerCase())
      );
    }

    if (filters.paymentDate) {
      filtered = filtered.filter(payment => 
        new Date(payment.createdAt).toLocaleDateString() === new Date(filters.paymentDate).toLocaleDateString()
      );
    }

    setFilteredPayments(filtered);
    setPage(0); // Reset to first page after filtering
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      className: "",
      teacherName: "",
      paymentDate: ""
    });
    setFilteredPayments(payments);
    setPage(0); // Reset to first page
  };

  // Handle page change for pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle viewing receipt details
  const handleViewReceipt = async (subscriptionId) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get(`http://localhost:5000/api/auth/subscriptions/receipt/${subscriptionId}`, config);
      setSelectedReceipt(data);
      setOpenReceiptDialog(true);
    } catch (error) {
      console.error("Error fetching receipt details:", error);
      alert("Failed to fetch receipt details. Please try again.");
    }
  };

  const handleCloseReceiptDialog = () => {
    setOpenReceiptDialog(false);
    setSelectedReceipt(null);
  };

  // Download receipt as CSV
  const handleDownloadCSV = () => {
    if (!selectedReceipt) return;

    const receiptData = [
      ["Invoice Number", selectedReceipt.invoiceNumber],
      ["Student Name", selectedReceipt.studentName],
      ["Student Email", selectedReceipt.studentEmail],
      ["Class Name", selectedReceipt.className],
      ["Teacher Name", selectedReceipt.teacherName],
      ["Original Fee", `$${selectedReceipt.originalFee}`],
      ["Discount Percentage", `${selectedReceipt.discountPercentage}%`],
      ["Final Fee", `$${selectedReceipt.finalFee}`],
      ["Payment Date", new Date(selectedReceipt.paymentDate).toLocaleDateString()],
      ["Payment Method", selectedReceipt.paymentMethod],
      ["Status", selectedReceipt.status]
    ];

    const csvContent = receiptData.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `receipt-${selectedReceipt.invoiceNumber}.csv`);
  };

  // Download receipt as XLSX
  const handleDownloadXLSX = () => {
    if (!selectedReceipt) return;

    const receiptData = [
      ["Invoice Number", selectedReceipt.invoiceNumber],
      ["Student Name", selectedReceipt.studentName],
      ["Student Email", selectedReceipt.studentEmail],
      ["Class Name", selectedReceipt.className],
      ["Teacher Name", selectedReceipt.teacherName],
      ["Original Fee", `$${selectedReceipt.originalFee}`],
      ["Discount Percentage", `${selectedReceipt.discountPercentage}%`],
      ["Final Fee", `$${selectedReceipt.finalFee}`],
      ["Payment Date", new Date(selectedReceipt.paymentDate).toLocaleDateString()],
      ["Payment Method", selectedReceipt.paymentMethod],
      ["Status", selectedReceipt.status]
    ];

    const ws = XLSX.utils.aoa_to_sheet(receiptData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Receipt");
    XLSX.writeFile(wb, `receipt-${selectedReceipt.invoiceNumber}.xlsx`);
  };

  // Download receipt as PDF
  const handleDownloadPDF = () => {
    if (!selectedReceipt) return;

    try {
      const doc = new jsPDF();
      if (!doc || typeof doc.setFontSize !== "function") {
        throw new Error("jsPDF instance is not properly initialized");
      }

      // Add site logo
      doc.addImage("/educonnetlogo.png", "PNG", 19, 17, 35, 30, undefined, 'FAST');

      // Add "RECEIPT" title
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(31, 58, 138); // #1e3a8a
      doc.text("RECEIPT", 105, 20, { align: "center" });

      // Add receipt details
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Invoice Number: ${selectedReceipt.invoiceNumber}`, 20, 50);
      doc.text(`Student Name: ${selectedReceipt.studentName}`, 20, 60);
      doc.text(`Student Email: ${selectedReceipt.studentEmail}`, 20, 70);
      doc.text(`Class Name: ${selectedReceipt.className}`, 20, 80);
      doc.text(`Teacher Name: ${selectedReceipt.teacherName}`, 20, 90);
      doc.text(`Payment Date: ${new Date(selectedReceipt.paymentDate).toLocaleDateString()}`, 20, 100);
      doc.text(`Payment Method: ${selectedReceipt.paymentMethod}`, 20, 110);
      doc.text(`Status: ${selectedReceipt.status}`, 20, 120);

      // Add billing details table
      doc.setFontSize(14);
      doc.text("Receipt Details", 20, 140);
      doc.setFontSize(12);
      autoTable(doc, {
        startY: 150,
        head: [["Description", "Price"]],
        body: [
          [`Original Fee`, `$${selectedReceipt.originalFee}`],
          [`Discount (${selectedReceipt.discountPercentage}%)`, `-${(selectedReceipt.originalFee - selectedReceipt.finalFee).toFixed(2)}`],
          ["Final Fee", `$${selectedReceipt.finalFee}`]
        ],
        theme: "grid",
        headStyles: { fillColor: [31, 58, 138], textColor: [255, 255, 255] },
        bodyStyles: { textColor: [0, 0, 0] },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });

      // Save the PDF
      doc.save(`receipt-${selectedReceipt.invoiceNumber}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

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
  }, [pageTitle]);

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
            <Typography variant="h5" gutterBottom className="font-bold text-gray-900">
              Payment History
            </Typography>

            {/* Modern Filter Section */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%)',
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                p: 3,
                mb: 6,
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
                },
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#1e3a8a' }}>
                Filter Payments
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Class Name"
                    name="className"
                    value={filters.className}
                    onChange={handleFilterChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search sx={{ color: '#1e3a8a' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: '#fff',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                        '&:hover fieldset': {
                          borderColor: '#1e3a8a',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#1e3a8a',
                          boxShadow: '0 0 0 3px rgba(30, 58, 138, 0.1)',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#6b7280',
                        '&.Mui-focused': {
                          color: '#1e3a8a',
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Teacher Name"
                    name="teacherName"
                    value={filters.teacherName}
                    onChange={handleFilterChange}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: '#1e3a8a' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: '#fff',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                        '&:hover fieldset': {
                          borderColor: '#1e3a8a',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#1e3a8a',
                          boxShadow: '0 0 0 3px rgba(30, 58, 138, 0.1)',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#6b7280',
                        '&.Mui-focused': {
                          color: '#1e3a8a',
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Payment Date"
                    name="paymentDate"
                    type="date"
                    value={filters.paymentDate}
                    onChange={handleFilterChange}
                    InputLabelProps={{ shrink: true }}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarToday sx={{ color: '#1e3a8a' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: '#fff',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                        '&:hover fieldset': {
                          borderColor: '#1e3a8a',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#1e3a8a',
                          boxShadow: '0 0 0 3px rgba(30, 58, 138, 0.1)',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#6b7280',
                        '&.Mui-focused': {
                          color: '#1e3a8a',
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      onClick={applyFilters}
                      sx={{
                        backgroundColor: '#1e3a8a', // Solid blue color
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        textTransform: 'none',
                        fontWeight: 'bold',
                        color: '#fff',
                        boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          backgroundColor: '#1e40af', // Slightly lighter blue on hover
                          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                          transform: 'translateY(-1px)',
                        },
                      }}
                    >
                      Filter
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={clearFilters}
                      sx={{
                        borderColor: '#1e3a8a',
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        textTransform: 'none',
                        fontWeight: 'bold',
                        color: '#1e3a8a',
                        backgroundColor: '#fff',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          borderColor: '#1e40af',
                          backgroundColor: '#f5f7fa',
                          boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)',
                          transform: 'translateY(-1px)',
                        },
                      }}
                    >
                      Clear
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {filteredPayments.length === 0 ? (
              <Typography className="text-gray-500 text-center py-6">No payment history found.</Typography>
            ) : (
              <>
                <TableContainer 
                  component={Paper} 
                  sx={{
                    mt: 4,
                    borderRadius: 3,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden',
                    backgroundColor: '#fff',
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow
                        sx={{
                          background: 'linear-gradient(90deg, #e8f0fe 0%, #d1e0ff 100%)',
                          '& th': {
                            fontWeight: 'bold',
                            color: '#1e3a8a',
                            fontSize: '1.1rem',
                            py: 2,
                            px: 3,
                            borderBottom: '2px solid #d1d5db',
                          },
                        }}
                      >
                        <TableCell>Class Name</TableCell>
                        <TableCell>Teacher</TableCell>
                        <TableCell>Fee Paid</TableCell>
                        <TableCell>Payment Date</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredPayments
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((payment, index) => (
                          <TableRow
                            key={payment._id}
                            sx={{
                              backgroundColor: index % 2 === 0 ? '#fafafa' : '#fff',
                              transition: 'all 0.3s ease-in-out',
                              '&:hover': {
                                backgroundColor: '#f1f5f9',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                              },
                              '& td': {
                                py: 2,
                                px: 3,
                                fontSize: '1rem',
                                color: '#374151',
                                borderBottom: '1px solid #e5e7eb',
                              },
                            }}
                          >
                            <TableCell>{payment.classId.subject}</TableCell>
                            <TableCell>{payment.classId.teacherId.name}</TableCell>
                            <TableCell>${payment.feePaid}</TableCell>
                            <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleViewReceipt(payment._id)}
                                sx={{
                                  backgroundColor: '#22c55e', // Green color
                                  borderRadius: 2,
                                  px: 2,
                                  py: 0.5,
                                  textTransform: 'none',
                                  fontWeight: 'bold',
                                  color: '#fff',
                                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                  transition: 'all 0.3s ease-in-out',
                                  '&:hover': {
                                    backgroundColor: '#16a34a', // Slightly darker green on hover
                                    boxShadow: '0 3px 6px rgba(0, 0, 0, 0.15)',
                                    transform: 'translateY(-1px)',
                                  },
                                }}
                              >
                                View Receipt
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={filteredPayments.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  rowsPerPageOptions={[]}
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count}`}
                  sx={{
                    '& .MuiTablePagination-toolbar': {
                      py: 1,
                      px: 3,
                      backgroundColor: '#fff',
                      borderTop: '1px solid #e5e7eb',
                    },
                    '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                      fontSize: '1rem',
                      color: '#374151',
                    },
                    '& .MuiTablePagination-actions button': {
                      color: '#1e3a8a',
                      '&:hover': {
                        backgroundColor: '#e8f0fe',
                        borderRadius: '50%',
                      },
                    },
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Receipt Details Dialog */}
      <Dialog open={openReceiptDialog} onClose={handleCloseReceiptDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: "#e8f0fe", textAlign: "center" }}>
          <Typography variant="h6" component="div" color="#1e3a8a">
            RECEIPT
          </Typography>
        </DialogTitle>
        <DialogContent
          sx={{
            // Remove scrollbar
            overflowY: 'hidden',
            // Cross-browser scrollbar hiding
            '&::-webkit-scrollbar': { display: 'none' }, // Chrome, Safari, Edge
            '-ms-overflow-style': 'none', // IE and Edge
            'scrollbar-width': 'none', // Firefox
            // Optional: Ensure content fits without overflow
            padding: 2,
          }}
        >
          {selectedReceipt && (
            <Box>
              {/* Site Logo */}
              <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                <img src="/educonnetlogo.png" alt="Site Logo" style={{ width: "100px", height: "auto" }} onError={(e) => e.target.style.display = 'none'} />
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography><strong>Invoice Number:</strong> {selectedReceipt.invoiceNumber}</Typography>
                <Typography><strong>Payment Date:</strong> {new Date(selectedReceipt.paymentDate).toLocaleDateString()}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography><strong>Student Name:</strong> {selectedReceipt.studentName}</Typography>
                <Typography><strong>Student Email:</strong> {selectedReceipt.studentEmail}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography><strong>Class Name:</strong> {selectedReceipt.className}</Typography>
                <Typography><strong>Teacher Name:</strong> {selectedReceipt.teacherName}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography><strong>Payment Method:</strong> {selectedReceipt.paymentMethod}</Typography>
                <Typography><strong>Status:</strong> {selectedReceipt.status}</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="h6" mb={1}>Receipt Details</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#e8f0fe" }}>
                      <TableCell sx={{ fontWeight: "bold", color: "#1e3a8a" }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: "bold", color: "#1e3a8a" }}>Price</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Original Fee</TableCell>
                      <TableCell>${selectedReceipt.originalFee}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Discount ({selectedReceipt.discountPercentage}%)</TableCell>
                      <TableCell>-${(selectedReceipt.originalFee - selectedReceipt.finalFee).toFixed(2)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Final Fee</strong></TableCell>
                      <TableCell><strong>${selectedReceipt.finalFee}</strong></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDownloadCSV} color="primary" variant="outlined">
            Download CSV
          </Button>
          <Button onClick={handleDownloadXLSX} color="primary" variant="outlined">
            Download XLSX
          </Button>
          <Button onClick={handleDownloadPDF} color="primary" variant="contained">
            Export PDF
          </Button>
          <Button onClick={handleCloseReceiptDialog} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PaymentHistoryDash;