import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Document, Page, pdfjs } from "react-pdf";
import { HiDocumentText, HiPaperClip } from "react-icons/hi";



// Set up the PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const FeeWaiverRequests = () => {
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

    useEffect(() => {
        const fetchRequests = async () => {
            setLoading(true);
            try {
                const userInfo = JSON.parse(localStorage.getItem("userInfo"));
                if (!userInfo || !userInfo.token) {
                    throw new Error("User not authenticated");
                }
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get("http://localhost:5000/api/auth/teacher/fee-waiver-requests", config);
                setRequests(data);
            } catch (err) {
                setError(err.response?.data?.message || "Error loading fee waiver requests");
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, []);

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
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
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
        <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
            <div className="bg-white rounded-xl shadow-md border border-blue-100 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <HiDocumentText className="w-8 h-8 text-blue-900" />
                    <h2 className="text-3xl font-bold text-blue-900">Fee Waiver Requests</h2>
                </div>
                {error && (
                    <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}
                {loading ? (
                    <div className="flex justify-center py-4">
                        <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                    </div>
                ) : requests.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full table-auto">
                            <thead>
                                <tr className="bg-blue-50 text-blue-900">
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Student</th>
                                    
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Reason</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Document</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Created At</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((request) => (
                                    <tr key={request._id} className="border-b border-blue-100 hover:bg-blue-50 transition-all duration-300">
                                        <td className="px-4 py-3 text-blue-600">
                                            {request.studentId?.name || "Unknown Student"}
                                        </td>
                                        
                                        <td className="px-4 py-3 text-blue-600">
                                            {request.reason.length > 50 ? request.reason.substring(0, 50) + "..." : request.reason}
                                        </td>
                                        <td className="px-4 py-3">
                                            {request.documentPath ? (
                                                <button
                                                    onClick={() => handleOpenDocumentDialog(request.documentPath)}
                                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                                                >
                                                    <HiPaperClip className="w-4 h-4" />
                                                    <span className="text-sm">View</span>
                                                </button>
                                            ) : (
                                                <span className="text-blue-600 text-sm">No Document</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-blue-600">{request.status}</td>
                                        <td className="px-4 py-3 text-blue-600">{new Date(request.createdAt).toLocaleString()}</td>
                                        <td className="px-4 py-3">
                                            {request.status === "Pending" && (
                                                <button
                                                    onClick={() => handleOpenDialog(request)}
                                                    className="bg-blue-600 text-white px-4 py-1 rounded-md hover:bg-blue-700 transition-all duration-300 text-sm"
                                                >
                                                    Review
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center p-4 bg-white rounded-lg border border-blue-100">
                        <p className="text-blue-600">No fee waiver requests available.</p>
                    </div>
                )}
            </div>

            {/* Dialog for approving/rejecting fee waiver requests */}
            {openDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-blue-900 mb-4">Review Fee Waiver Request</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-blue-900 mb-1">Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    required
                                    className="w-full px-4 py-2 border rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 border-gray-300"
                                >
                                    <option value="">Select status</option>
                                    <option value="Approved">Approve</option>
                                    <option value="Rejected">Reject</option>
                                </select>
                            </div>
                            {status === "Approved" && (
                                <div>
                                    <label className="block text-sm font-medium text-blue-900 mb-1">Discount Percentage</label>
                                    <input
                                        type="number"
                                        value={discountPercentage}
                                        onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                                        min="0"
                                        max="100"
                                        required
                                        className="w-full px-4 py-2 border rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 border-gray-300"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-blue-900 mb-1">Comments (Optional)</label>
                                <textarea
                                    value={teacherComments}
                                    onChange={(e) => setTeacherComments(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-md bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 border-gray-300 h-24 resize-none"
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                onClick={handleCloseDialog}
                                className="px-4 py-2 bg-gray-300 text-gray-900 rounded-md hover:bg-gray-400 transition-all duration-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!status}
                                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-300 ${
                                    !status ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
    );
};

export default FeeWaiverRequests;