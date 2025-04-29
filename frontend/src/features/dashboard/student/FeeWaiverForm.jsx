import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Document, Page, pdfjs } from "react-pdf";
import {
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Alert,
    CircularProgress,
    IconButton
} from "@mui/material";
import { Clear as ClearIcon } from "@mui/icons-material";
import useAuth from "../../../hooks/useAuth";

// Set up the PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const FeeWaiverForm = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [reason, setReason] = useState("");
    const [document, setDocument] = useState(null);
    const [documentPreviewUrl, setDocumentPreviewUrl] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [imageError, setImageError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("reason", reason);
            if (document) {
                formData.append("document", document);
            }

            const config = { headers: { Authorization: `Bearer ${user.token}`, "Content-Type": "multipart/form-data" } };
            const { data } = await axios.post(
                "http://localhost:5000/api/auth/support/fee-waiver",
                formData,
                config
            );

            setSuccess(data.message);
            setReason("");
            setDocument(null);
            setDocumentPreviewUrl(null);
            setNumPages(null);
            setPageNumber(1);
            setImageError(null);
            setTimeout(() => navigate(`/student/dashboard`), 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Error submitting fee waiver application");
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setDocument(file);
        setImageError(null);
        if (file) {
            // Create a temporary URL for previewing the file
            const url = URL.createObjectURL(file);
            console.log("Preview URL for document:", url);
            setDocumentPreviewUrl(url);
            setPageNumber(1);
            setNumPages(null);
        } else {
            setDocumentPreviewUrl(null);
            setNumPages(null);
            setPageNumber(1);
        }
    };

    const handleRemoveDocument = () => {
        setDocument(null);
        setDocumentPreviewUrl(null);
        setNumPages(null);
        setPageNumber(1);
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
        setImageError("Failed to load image preview.");
    };

    const getFileType = (file) => {
        if (!file) return null;
        const extension = file.name.split('.').pop().toLowerCase();
        return ['jpg', 'jpeg', 'png'].includes(extension) ? 'image' : extension === 'pdf' ? 'pdf' : null;
    };

    return (
        <Box sx={{ maxWidth: 800, mx: "auto", p: 3, mt: "50px" }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h4" gutterBottom>Apply for Fee Waiver</Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Reason for Financial Hardship"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        variant="outlined"
                        multiline
                        rows={4}
                        sx={{ mb: 2 }}
                        required
                    />
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        Upload Supporting Document (PDF, JPEG, PNG, max 5MB)
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <input
                            type="file"
                            accept=".pdf,.jpeg,.jpg,.png"
                            onChange={handleFileChange}
                            style={{ marginRight: "16px" }}
                        />
                        {document && (
                            <IconButton onClick={handleRemoveDocument} color="error">
                                <ClearIcon />
                            </IconButton>
                        )}
                    </Box>
                    {documentPreviewUrl && (
                        <Box sx={{ mb: 2, textAlign: "center" }}>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                Document Preview:
                            </Typography>
                            {getFileType(document) === "pdf" ? (
                                <Box>
                                    <Document
                                        file={documentPreviewUrl}
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
                            ) : getFileType(document) === "image" ? (
                                <Box>
                                    {imageError ? (
                                        <Typography variant="body1" color="error">
                                            {imageError}
                                        </Typography>
                                    ) : (
                                        <img
                                            src={documentPreviewUrl}
                                            alt="Fee Waiver Document Preview"
                                            style={{ maxWidth: "100%", maxHeight: "300px" }}
                                            onError={handleImageError}
                                        />
                                    )}
                                </Box>
                            ) : (
                                <Typography variant="body1" color="error">
                                    Unsupported file type
                                </Typography>
                            )}
                        </Box>
                    )}
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={loading}
                        sx={{ py: 1.5, textTransform: 'none' }}
                    >
                        {loading ? <CircularProgress size={24} /> : "Submit"}
                    </Button>
                </form>
            </Paper>
        </Box>
    );
};

export default FeeWaiverForm;