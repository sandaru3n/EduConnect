//frontend/src/features/dashboard/student/PaymentHistory.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from "@mui/material";

const PaymentHistory = () => {
    const [payments, setPayments] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPaymentHistory = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem("userInfo"));
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get("http://localhost:5000/api/subscriptions/payment-history", config);
                setPayments(data);
            } catch (error) {
                console.error("Error fetching payment history:", error);
            }
        };
        fetchPaymentHistory();
    }, []);

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <Typography variant="h5" gutterBottom className="font-bold text-gray-900">
                Payment History
            </Typography>
            {payments.length === 0 ? (
                <Typography className="text-gray-500 text-center py-6">No payment history found.</Typography>
            ) : (
                <TableContainer component={Paper} className="mt-4">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell className="font-semibold">Class Name</TableCell>
                                <TableCell className="font-semibold">Teacher</TableCell>
                                <TableCell className="font-semibold">Fee Paid</TableCell>
                                <TableCell className="font-semibold">Payment Date</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {payments.map((payment) => (
                                <TableRow key={payment._id} className="hover:bg-gray-50">
                                    <TableCell>{payment.classId.subject}</TableCell>
                                    <TableCell>{payment.classId.teacherId.name}</TableCell>
                                    <TableCell>${payment.feePaid}</TableCell>
                                    <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </div>
    );
};

export default PaymentHistory;