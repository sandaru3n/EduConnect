//frontend/src/features/dashboard/student/FeeWaiverForm.jsx
import StudentSidebar from "../../../components/StudentSidebar/index";
import StudentHeader from "../../../components/StudentHeader/index";
import { Breadcrumbs, Link as MuiLink, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";



import axios from "axios";
import { Document, Page, pdfjs } from "react-pdf";
import { HiCheckCircle, HiXCircle, HiClock, HiPaperClip} from "react-icons/hi";
import ClearIcon from '@mui/icons-material/Clear';
import useAuth from "../../../hooks/useAuth";

// Set up the PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const FeeWaiverForm = () => {
    const { user } = useAuth();
    const [reason, setReason] = useState("");
    const [document, setDocument] = useState(null);
    const [documentPreviewUrl, setDocumentPreviewUrl] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [imageError, setImageError] = useState(null);
    const [feeWaivers, setFeeWaivers] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [historyError, setHistoryError] = useState(null);
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [classesLoading, setClassesLoading] = useState(true);
    const [classesError, setClassesError] = useState(null);
    const [openDocumentDialog, setOpenDocumentDialog] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);

    // Fetch all classes on mount
    useEffect(() => {
        const fetchClasses = async () => {
            setClassesLoading(true);
            try {
                const userInfo = JSON.parse(localStorage.getItem("userInfo"));
                if (!userInfo || !userInfo.token) {
                    throw new Error("User not authenticated");
                }
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get("http://localhost:5000/api/auth/support/student-classes", config);
                setClasses(data);
                setClassesLoading(false);
            } catch (err) {
                setClassesError(err.response?.data?.message || "Failed to fetch classes");
                setClassesLoading(false);
            }
        };
        fetchClasses();
    }, []);

    // Fetch fee waiver history on mount
    useEffect(() => {
        const fetchFeeWaiverHistory = async () => {
            setHistoryLoading(true);
            try {
                const userInfo = JSON.parse(localStorage.getItem("userInfo"));
                if (!userInfo || !userInfo.token) {
                    throw new Error("User not authenticated");
                }
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get("http://localhost:5000/api/auth/support/fee-waiver/history", config);
                setFeeWaivers(data);
                setHistoryLoading(false);
            } catch (err) {
                setHistoryError(err.response?.data?.message || "Failed to fetch fee waiver history");
                setHistoryLoading(false);
            }
        };
        fetchFeeWaiverHistory();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("reason", reason);
            formData.append("classId", selectedClass); // Include selected class
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
            setSelectedClass("");
            setDocument(null);
            setDocumentPreviewUrl(null);
            setNumPages(null);
            setPageNumber(1);
            setImageError(null);
            // Refresh fee waiver history
            const { data: updatedHistory } = await axios.get("http://localhost:5000/api/auth/support/fee-waiver/history", config);
            setFeeWaivers(updatedHistory);
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
        const extension = file.name ? file.name.split('.').pop().toLowerCase() : file.split('.').pop().toLowerCase();
        return ['jpg', 'jpeg', 'png'].includes(extension) ? 'image' : extension === 'pdf' ? 'pdf' : null;
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "Approved":
                return <HiCheckCircle className="w-5 h-5 text-green-600" />;
            case "Rejected":
                return <HiXCircle className="w-5 h-5 text-red-600" />;
            case "Pending":
            default:
                return <HiClock className="w-5 h-5 text-yellow-600" />;
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

    const location = useLocation();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

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
                    <div className="max-w-7xl mx-auto p-6 bg-white-50 min-h-screen">
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Apply for Fee Waiver - Sticky Left Side */}
                <div className="lg:w-3/5 ">
                    <div className="sticky top-6 bg-white rounded-xl shadow-md border border-blue-100 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            
                            <h2 className="text-4xl font-bold text-blue-900">Apply for Fee Waiver</h2>
                        </div>
                        {error && (
                            <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                                {success}
                            </div>
                        )}
                        {classesError && (
                            <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                                {classesError}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-1">
                            <div>
                                <label className="block text-base font-medium text-blue-900 mb-2">
                                    Select Class
                                </label>
                                {classesLoading ? (
                                    <div className="flex justify-start py-2">
                                        <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                        </svg>
                                    </div>
                                ) : (
                                    <select
                                        value={selectedClass}
                                        onChange={(e) => setSelectedClass(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 border rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 border-gray-300 text-lg"
                                    >
                                        <option value="">Select a class</option>
                                        {classes.map((cls) => (
                                            <option key={cls._id} value={cls._id}>
                                                {cls.subject} (Teacher: {cls.teacherId?.name || "N/A"})
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            <div>
                                <textarea
                                    placeholder="Reason for Financial Hardship"
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 border rounded-md bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 border-gray-300 h-40 resize-none text-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-base font-medium text-blue-900 mb-2">
                                    Upload Supporting Document (PDF, JPEG, PNG, max 5MB)
                                </label>
                                <div className="flex items-center">
                                    <input
                                        type="file"
                                        accept=".pdf,.jpeg,.jpg,.png"
                                        onChange={handleFileChange}
                                        className="w-full px-4 py-3 border rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 border-gray-300 text-base"
                                    />
                                    {document && (
                                        <button
                                            type="button"
                                            onClick={handleRemoveDocument}
                                            className="ml-3 text-red-600 hover:text-red-800 transition-all duration-300"
                                        >
                                            <ClearIcon fontSize="large" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            {documentPreviewUrl && (
                                <div className="text-center">
                                    <p className="text-blue-900 font-medium text-lg mb-3">Document Preview:</p>
                                    {getFileType(document) === "pdf" ? (
                                        <div>
                                            <Document
                                                file={documentPreviewUrl}
                                                onLoadSuccess={onDocumentLoadSuccess}
                                                onLoadError={(error) => setError("Error loading PDF: " + error.message)}
                                            >
                                                <Page pageNumber={pageNumber} />
                                            </Document>
                                            <div className="mt-3">
                                                <p className="text-blue-600 text-sm">
                                                    Page {pageNumber} of {numPages}
                                                </p>
                                                <div className="flex justify-center gap-3 mt-2">
                                                    <button
                                                        type="button"
                                                        onClick={handlePreviousPage}
                                                        disabled={pageNumber <= 1}
                                                        className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 transition-all duration-300"
                                                    >
                                                        Previous
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleNextPage}
                                                        disabled={pageNumber >= numPages}
                                                        className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 transition-all duration-300"
                                                    >
                                                        Next
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : getFileType(document) === "image" ? (
                                        <div>
                                            {imageError ? (
                                                <p className="text-red-600">{imageError}</p>
                                            ) : (
                                                <img
                                                    src={documentPreviewUrl}
                                                    alt="Fee Waiver Document Preview"
                                                    className="max-w-full h-auto rounded-md shadow-sm mx-auto"
                                                    style={{ maxHeight: "400px" }}
                                                    onError={handleImageError}
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-red-600">Unsupported file type</p>
                                    )}
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full bg-blue-600 text-white py-4 rounded-md hover:bg-blue-700 transition-all duration-300 font-semibold shadow-md transform hover:scale-105 text-lg ${
                                    loading ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            >
                                {loading ? (
                                    <svg className="animate-spin h-6 w-6 mx-auto text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                    </svg>
                                ) : (
                                    "Submit Application"
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Fee Waiver History - Right Side */}
                <div className="lg:w-2/5">
                    <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            
                            <h2 className="text-2xl font-bold text-blue-900">Fee Waiver History</h2>
                        </div>
                        {historyLoading ? (
                            <div className="flex justify-center py-4">
                                <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                </svg>
                            </div>
                        ) : historyError ? (
                            <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                                {historyError}
                            </div>
                        ) : feeWaivers.length === 0 ? (
                            <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
                                <p className="text-blue-600">No fee waiver applications found.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {feeWaivers.map((waiver, index) => (
                                    <div
                                        key={waiver._id}
                                        className={`bg-white rounded-lg shadow-sm border p-4 transition-all duration-300 ${
                                            waiver.status === "Approved"
                                                ? "border-green-500 bg-green-50/30"
                                                : waiver.status === "Rejected"
                                                ? "border-red-200"
                                                : "border-blue-100 hover:border-blue-200"
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-600 font-semibold w-6">{index + 1}.</span>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        {getStatusIcon(waiver.status)}
                                                        <h4 className="text-base font-semibold text-blue-900">
                                                            Fee Waiver Application
                                                        </h4>
                                                    </div>
                                                    <p className="text-blue-600 text-sm mt-1">
                                                        Class: {waiver.classId?.subject || "N/A"}
                                                    </p>
                                                    <p className="text-blue-600 text-sm">
                                                        Reason: {waiver.reason}
                                                    </p>
                                                    <p className="text-blue-600 text-sm">
                                                        Status: {waiver.status}
                                                    </p>
                                                    {waiver.status === "Approved" && (
                                                        <p className="text-blue-600 text-sm">
                                                            Discount: {waiver.discountPercentage}%
                                                        </p>
                                                    )}
                                                    {waiver.teacherComments && (
                                                        <p className="text-blue-600 text-sm">
                                                            Teacher Comments: {waiver.teacherComments}
                                                        </p>
                                                    )}
                                                    <p className="text-blue-600 text-sm">
                                                        Submitted: {new Date(waiver.createdAt).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-blue-600 text-sm">
                                                        Updated: {new Date(waiver.updatedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            {waiver.documentPath && (
                                                <button
                                                    onClick={() => handleOpenDocumentDialog(waiver.documentPath)}
                                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                                                >
                                                    <HiPaperClip className="w-4 h-4" />
                                                    <span className="text-sm">View</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Dialog for viewing documents */}
            {openDocumentDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 max-w-3xl w-full">
                        <h3 className="text-xl font-bold text-blue-900 mb-4">View Document</h3>
                        <div className="text-center">
                            {selectedDocument && (
                                <>
                                    {getFileType(selectedDocument) === "pdf" ? (
                                        <div>
                                            <Document
                                                file={`http://localhost:5000${selectedDocument}`}
                                                onLoadSuccess={onDocumentLoadSuccess}
                                                onLoadError={(error) => setError("Error loading PDF: " + error.message)}
                                            >
                                                <Page pageNumber={pageNumber} />
                                            </Document>
                                            <div className="mt-3">
                                                <p className="text-blue-600 text-sm">
                                                    Page {pageNumber} of {numPages}
                                                </p>
                                                <div className="flex justify-center gap-3 mt-2">
                                                    <button
                                                        onClick={handlePreviousPage}
                                                        disabled={pageNumber <= 1}
                                                        className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 transition-all duration-300"
                                                    >
                                                        Previous
                                                    </button>
                                                    <button
                                                        onClick={handleNextPage}
                                                        disabled={pageNumber >= numPages}
                                                        className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 transition-all duration-300"
                                                    >
                                                        Next
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : getFileType(selectedDocument) === "image" ? (
                                        <div>
                                            {imageError ? (
                                                <p className="text-red-600">{imageError}</p>
                                            ) : (
                                                <img
                                                    src={`http://localhost:5000${selectedDocument}`}
                                                    alt="Fee Waiver Document"
                                                    className="max-w-full h-auto rounded-md mx-auto"
                                                    style={{ maxHeight: "500px" }}
                                                    onError={handleImageError}
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-red-600">Unsupported file type</p>
                                    )}
                                </>
                            )}
                        </div>
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={handleCloseDocumentDialog}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-300"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeeWaiverForm;







