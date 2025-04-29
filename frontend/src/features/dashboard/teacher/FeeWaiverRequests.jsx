import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Document, Page, pdfjs } from "react-pdf";
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Alert,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from "@mui/material";
import useAuth from "../../../hooks/useAuth";

// Set up the PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const FeeWaiverRequests = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [openDocumentDialog, setOpenDocumentDialog] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [status, setStatus] = useState("");
    const [teacherComments, setTeacherComments] = useState("");
    const [discountPercentage, setDiscountPercentage] = useState(0);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [imageError, setImageError] = useState(null);

    // Ref for focusing the dialog
    const dialogRef = useRef(null);

    useEffect(() => {
        const fetchRequests = async () => {
            setLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get("http://localhost:5000/api/auth/teacher/fee-waiver-requests", config);
                setRequests(data);
            } catch (err) {
                setError(err.response?.data?.message || "Error loading fee waiver requests");
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, [user.token]);

    const handleOpenDialog = (request) => {
        setSelectedRequest(request);
        setStatus("");
        setTeacherComments("");
        setDiscountPercentage(0);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedRequest(null);
    };

    const handleSubmit = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(
                `http://localhost:5000/api/auth/teacher/fee-waiver/${selectedRequest._id}/status`,
                { status, teacherComments, discountPercentage },
                config
            );

            setRequests(requests.map(req => req._id === selectedRequest._id ? data.feeWaiver : req));
            handleCloseDialog();
        } catch (err) {
            setError(err.response?.data?.message || "Error updating fee waiver request");
        }
    };

    const handleOpenDocumentDialog = (documentPath) => {
        console.log("Opening document:", `http://localhost:5000${documentPath}`);
        setSelectedDocument(documentPath);
        setPageNumber(1);
        setNumPages(null);
        setImageError(null);
        setOpenDocumentDialog(true);
    };

    const handleCloseDocumentDialog = () => {
        setOpenDocumentDialog(false);
        setSelectedDocument(null);
        setImageError(null);
    };

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const handlePreviousPage = () => {
        if (pageNumber > 1) {
            setPageNumber(pageNumber - 1);
        }
    };

    const handleNextPage = () => {
        if (pageNumber < numPages) {
            setPageNumber(pageNumber + 1);
        }
    };

    const handleImageError = () => {
        setImageError("Failed to load image. The file may not exist or is inaccessible.");
    };

    const getFileType = (filePath) => {
        if (!filePath) return null;
        const extension = filePath.split('.').pop().toLowerCase();
        return ['jpg', 'jpeg', 'png'].includes(extension) ? 'image' : extension === 'pdf' ? 'pdf' : null;
    };

    return (
        <Box sx={{ maxWidth: 1200, mx: "auto", p: 3, mt: "50px" }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h4" gutterBottom>Fee Waiver Requests</Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {loading ? (
                    <Typography variant="body1" color="text.secondary">Loading requests...</Typography>
                ) : requests.length > 0 ? (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Student</TableCell>
                                    <TableCell>Reason</TableCell>
                                    <TableCell>Document</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Created At</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {requests.map((request) => (
                                    <TableRow key={request._id}>
                                        <TableCell>{request.studentId?.name || "N/A"}</TableCell>
                                        <TableCell>{request.reason.length > 50 ? request.reason.substring(0, 50) + "..." : request.reason}</TableCell>
                                        <TableCell>
                                            {request.documentPath ? (
                                                <Button
                                                    variant="outlined"
                                                    color="primary"
                                                    size="small"
                                                    onClick={() => handleOpenDocumentDialog(request.documentPath)}
                                                >
                                                    View Document
                                                </Button>
                                            ) : "N/A"}
                                        </TableCell>
                                        <TableCell>{request.status}</TableCell>
                                        <TableCell>{new Date(request.createdAt).toLocaleString()}</TableCell>
                                        <TableCell>
                                            {request.status === "Pending" && (
                                                <Button
                                                    variant="outlined"
                                                    color="primary"
                                                    size="small"
                                                    onClick={() => handleOpenDialog(request)}
                                                >
                                                    Review
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Typography variant="body1" color="text.secondary">
                        No fee waiver requests available.
                    </Typography>
                )}
            </Paper>

            {/* Dialog for approving/rejecting fee waiver requests */}
            <Dialog 
                open={openDialog} 
                onClose={handleCloseDialog}
                onEntered={() => dialogRef.current?.focus()}
                disableEnforceFocus
            >
                <DialogTitle>Review Fee Waiver Request</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth variant="outlined" sx={{ mt: 2, mb: 2 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            label="Status"
                            required
                            inputProps={{ ref: dialogRef }}
                        >
                            <MenuItem value=""><em>Select status</em></MenuItem>
                            <MenuItem value="Approved">Approve</MenuItem>
                            <MenuItem value="Rejected">Reject</MenuItem>
                        </Select>
                    </FormControl>
                    {status === "Approved" && (
                        <TextField
                            fullWidth
                            label="Discount Percentage"
                            type="number"
                            value={discountPercentage}
                            onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                            variant="outlined"
                            sx={{ mb: 2 }}
                            inputProps={{ min: 0, max: 100 }}
                            required
                        />
                    )}
                    <TextField
                        fullWidth
                        label="Comments (Optional)"
                        value={teacherComments}
                        onChange={(e) => setTeacherComments(e.target.value)}
                        variant="outlined"
                        multiline
                        rows={3}
                        sx={{ mb: 2 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} color="primary" disabled={!status}>
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog for viewing documents */}
            <Dialog 
                open={openDocumentDialog} 
                onClose={handleCloseDocumentDialog} 
                maxWidth="md" 
                fullWidth
                disableEnforceFocus
            >
                <DialogTitle>View Document</DialogTitle>
                <DialogContent>
                    {selectedDocument && (
                        <>
                            {getFileType(selectedDocument) === "pdf" ? (
                                <Box sx={{ textAlign: "center" }}>
                                    <Document
                                        file={`http://localhost:5000${selectedDocument}`}
                                        onLoadSuccess={onDocumentLoadSuccess}
                                        onLoadError={(error) => setError("Error loading PDF: " + error.message)}
                                    >
                                        <Page pageNumber={pageNumber} />
                                    </Document>
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="body2">
                                            Page {pageNumber} of {numPages}
                                        </Typography>
                                        <Button
                                            onClick={handlePreviousPage}
                                            disabled={pageNumber <= 1}
                                            sx={{ mr: 1 }}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            onClick={handleNextPage}
                                            disabled={pageNumber >= numPages}
                                        >
                                            Next
                                        </Button>
                                    </Box>
                                </Box>
                            ) : getFileType(selectedDocument) === "image" ? (
                                <Box sx={{ textAlign: "center" }}>
                                    {imageError ? (
                                        <Typography variant="body1" color="error">
                                            {imageError}
                                        </Typography>
                                    ) : (
                                        <img
                                            src={`http://localhost:5000${selectedDocument}`}
                                            alt="Fee Waiver Document"
                                            style={{ maxWidth: "100%", maxHeight: "500px" }}
                                            onError={handleImageError}
                                        />
                                    )}
                                </Box>
                            ) : (
                                <Typography variant="body1" color="error">
                                    Unsupported file type
                                </Typography>
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDocumentDialog} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default FeeWaiverRequests;