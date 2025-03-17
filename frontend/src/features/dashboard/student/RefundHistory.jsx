// frontend/src/features/dashboard/student/RefundHistory.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from "@mui/material";

const RefundHistory = () => {
    const [refunds, setRefunds] = useState([]);

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

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <Typography variant="h5" gutterBottom className="font-bold text-gray-900">
                Refund History
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
                                <TableCell className="font-semibold">Class Fee</TableCell>
                                <TableCell className="font-semibold">Status</TableCell>
                                <TableCell className="font-semibold">Request Date</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {refunds.map((refund) => (
                                <TableRow key={refund._id} className="hover:bg-gray-50">
                                    <TableCell>{refund._id}</TableCell>
                                    <TableCell>{refund.classId.subject}</TableCell>
                                    <TableCell>${refund.classFee}</TableCell>
                                    <TableCell>{refund.status}</TableCell>
                                    <TableCell>{new Date(refund.requestDate).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </div>
    );
};

export default RefundHistory;