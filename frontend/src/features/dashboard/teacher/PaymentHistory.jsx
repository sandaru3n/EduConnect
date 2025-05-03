import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Alert, Button, Dialog, DialogTitle, DialogContent, DialogActions, Divider } from "@mui/material";
import { HiDocumentText } from "react-icons/hi";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';

const PaymentHistory = () => {
  const navigate = useNavigate();
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openInvoiceDialog, setOpenInvoiceDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (!userInfo || !userInfo.token) {
          throw new Error("User not authenticated");
        }
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get("http://localhost:5000/api/auth/dashboard/teacher-payment-history", config);
        setPaymentHistory(data);
      } catch (err) {
        if (err.message === "User not authenticated") {
          navigate("/login");
        } else if (err.response && err.response.status === 404) {
          setError("Payment history endpoint not found. Please contact support.");
        } else if (err.response && err.response.status === 403) {
          setError("You do not have permission to access this data. Only teachers and institutes can view payment history.");
        } else {
          setError(err.response?.data?.message || "Error fetching payment history");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentHistory();
  }, [navigate]);

  const handleViewInvoice = (payment) => {
    setSelectedInvoice(payment);
    setOpenInvoiceDialog(true);
  };

  const handleCloseInvoiceDialog = () => {
    setOpenInvoiceDialog(false);
    setSelectedInvoice(null);
  };

  const handleGeneratePDF = () => {
    if (!selectedInvoice) return;

    try {
      const doc = new jsPDF();
      if (!doc || typeof doc.setFontSize !== "function") {
        throw new Error("jsPDF instance is not properly initialized");
      }

      // Add site logo
      // Option 1: Use the logo file from public/ (ensure logo.png exists in public/)
      doc.addImage("/educonnetlogo.png", "PNG", 19, 17, 35, 30, undefined, 'FAST'); // Adjust dimensions as needed
      // Option 2: Use a base64 string if the file approach doesn't work
      // const logoBase64 = "data:image/png;base64,iVBORw0KGgo..."; // Replace with your logo's base64 string
      // doc.addImage(logoBase64, "PNG", 10, 10, 30, 30, undefined, 'FAST');

      // Add "INVOICE" title
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(31, 58, 138); // #1e3a8a
      doc.text("INVOICE", 105, 20, { align: "center"});

      // Add invoice details
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Invoice Number: ${selectedInvoice.invoiceNumber}`, 20, 50);
      doc.text(`Date of Issue: ${new Date(selectedInvoice.paymentDate).toLocaleDateString()}`, 20, 60);
      doc.text(`Date Due: ${new Date(selectedInvoice.dueDate).toLocaleDateString()}`, 20, 70);

      // Add billing details table using autoTable
      doc.setFontSize(14);
      doc.text("Invoice Details", 20, 90);
      doc.setFontSize(12);
      autoTable(doc, {
        startY: 100,
        head: [["Description", "Price"]],
        body: [
          [selectedInvoice.description, `$${selectedInvoice.amount}`],
          ["Subtotal", `$${selectedInvoice.subtotal}`]
        ],
        theme: "grid",
        headStyles: { fillColor: [31, 58, 138], textColor: [255, 255, 255] },
        bodyStyles: { textColor: [0, 0, 0] },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });

      // Save the PDF
      doc.save(`invoice-${selectedInvoice.invoiceNumber}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };

  return (
    <Box sx={{ maxWidth: "1200px", mx: "auto", p: 3, mt: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
        <HiDocumentText style={{ fontSize: "2rem", color: "#1e3a8a" }} />
        <Typography variant="h4" fontWeight="bold" color="text.primary">
          Payment History
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "300px" }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }} color="text.secondary">
            Loading payment history...
          </Typography>
        </Box>
      ) : paymentHistory.length === 0 ? (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography color="text.secondary">
            No payment history found.
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#e8f0fe" }}>
                <TableCell sx={{ fontWeight: "bold", color: "#1e3a8a" }}>Plan</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#1e3a8a" }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#1e3a8a" }}>Payment Date</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#1e3a8a" }}>Payment Method</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#1e3a8a" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: "bold", color: "#1e3a8a" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paymentHistory.map((payment) => (
                <TableRow key={payment._id} sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
                  <TableCell>{payment.subscriptionId?.plan || "Unknown Plan"}</TableCell>
                  <TableCell>${payment.amount}</TableCell>
                  <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                  <TableCell>{payment.paymentMethod}</TableCell>
                  <TableCell>{payment.status}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={() => handleViewInvoice(payment)}
                    >
                      View Invoice
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Invoice Details Dialog */}
      <Dialog open={openInvoiceDialog} onClose={handleCloseInvoiceDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "#e8f0fe", textAlign: "center" }}>
          <Typography variant="h6" component="div" color="#1e3a8a">
            INVOICE
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedInvoice && (
            <Box>
              {/* Site Logo */}
              <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                <img src="/logo.png" alt="Site Logo" style={{ width: "100px", height: "auto" }} onError={(e) => e.target.style.display = 'none'} />
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography><strong>Invoice Number:</strong> {selectedInvoice.invoiceNumber}</Typography>
                <Typography><strong>Date of Issue:</strong> {new Date(selectedInvoice.paymentDate).toLocaleDateString()}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography><strong>Date Due:</strong> {new Date(selectedInvoice.dueDate).toLocaleDateString()}</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="h6" mb={1}>Invoice Details</Typography>
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
                      <TableCell>{selectedInvoice.description}</TableCell>
                      <TableCell>${selectedInvoice.amount}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell><strong>Subtotal</strong></TableCell>
                      <TableCell><strong>${selectedInvoice.subtotal}</strong></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseInvoiceDialog} color="primary">
            Close
          </Button>
          <Button onClick={handleGeneratePDF} color="primary" variant="contained">
            Export PDF
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentHistory;