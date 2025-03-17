// frontend/src/features/dashboard/admin/RefundManagement.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";

const RefundManagement = () => {
    const [refunds, setRefunds] = useState([]);
    const [selectedRefund, setSelectedRefund] = useState(null);
    const [open, setOpen] = useState(false);

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

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <Typography variant="h5" gutterBottom className="font-bold text-gray-900">
                Refund Requests
            </Typography>
            {refunds.length === 0 ? (
                <Typography className="text-gray-500 text-center py-6">No refund requests found.</Typography>
            ) : (
                <TableContainer component={Paper} className="mt-4">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell className="font-semibold">Refund ID</TableCell>
                                <TableCell className="font-semibold">Class Name</TableCell>
                                <TableCell className="font-semibold">Teacher Name</TableCell>
                                <TableCell className="font-semibold">Class Fee</TableCell>
                                <TableCell className="font-semibold">Student Name</TableCell>
                                <TableCell className="font-semibold">Status</TableCell>
                                <TableCell className="font-semibold">Request Date</TableCell>
                                <TableCell className="font-semibold">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {refunds.map((refund) => (
                                <TableRow key={refund._id} className="hover:bg-gray-50">
                                    <TableCell>{refund._id}</TableCell>
                                    <TableCell>{refund.classId.subject}</TableCell>
                                    <TableCell>{refund.classId.teacherId.name}</TableCell>
                                    <TableCell>${refund.classFee}</TableCell>
                                    <TableCell>{refund.studentId.name}</TableCell>
                                    <TableCell>{refund.status}</TableCell>
                                    <TableCell>{new Date(refund.requestDate).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Button onClick={() => handleViewDetails(refund)} color="primary">View Details</Button>
                                        {refund.status === 'Pending' && (
                                            <>
                                                <Button onClick={() => handleStatusUpdate(refund._id, 'Approved')} color="success">Approve</Button>
                                                <Button onClick={() => handleStatusUpdate(refund._id, 'Rejected')} color="error">Reject</Button>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Dialog for Viewing Refund Details */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Refund Request Details</DialogTitle>
                <DialogContent>
                    {selectedRefund && (
                        <>
                            <Typography><strong>Class:</strong> {selectedRefund.classId.subject}</Typography>
                            <Typography><strong>Student:</strong> {selectedRefund.studentId.name}</Typography>
                            <Typography><strong>Fee:</strong> ${selectedRefund.classFee}</Typography>
                            <Typography><strong>Reason:</strong> {selectedRefund.reason}</Typography>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default RefundManagement;