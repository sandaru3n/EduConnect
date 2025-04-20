import { useState, useEffect } from "react";
import axios from "axios";
import {
    Box,
    Typography,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Chip
} from "@mui/material";

const ManageExtensionRequests = () => {
    const [requests, setRequests] = useState([]);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };
            const { data } = await axios.get(
                "http://localhost:5000/api/classes/extension/requests",
                config
            );
            setRequests(data);
        } catch (err) {
            setError(err.response?.data?.message || "Error fetching extension requests");
        }
    };

    const handleRequest = async (materialId, requestId, status) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };
            await axios.post(
                "http://localhost:5000/api/classes/extension/handle",
                { materialId, requestId, status },
                config
            );
            setSuccess(`Request ${status} successfully`);
            fetchRequests();
        } catch (err) {
            setError(err.response?.data?.message || `Error ${status.toLowerCase()} request`);
        }
    };

    return (
        <Box sx={{ maxWidth: 1000, mx: "auto", p: 3 }}>
            <Typography variant="h4" gutterBottom>Manage Extension Requests</Typography>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
            {requests.length === 0 ? (
                <Typography>No extension requests found</Typography>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Class</TableCell>
                                <TableCell>Lesson</TableCell>
                                <TableCell>Student</TableCell>
                                <TableCell>Reason</TableCell>
                                <TableCell>Requested At</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {requests.map(request => (
                                <TableRow key={request.requestId}>
                                    <TableCell>{request.classSubject}</TableCell>
                                    <TableCell>{request.lessonName}</TableCell>
                                    <TableCell>{request.studentName} ({request.studentEmail})</TableCell>
                                    <TableCell>{request.reason}</TableCell>
                                    <TableCell>
                                        {new Date(request.requestedAt).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={request.status}
                                            color={
                                                request.status === 'approved' ? 'success' :
                                                request.status === 'rejected' ? 'error' : 'warning'
                                            }
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {request.status === 'pending' ? (
                                            <>
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    size="small"
                                                    onClick={() => handleRequest(request.materialId, request.requestId, 'approved')}
                                                    sx={{ mr: 1 }}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    color="error"
                                                    size="small"
                                                    onClick={() => handleRequest(request.materialId, request.requestId, 'rejected')}
                                                >
                                                    Reject
                                                </Button>
                                            </>
                                        ) : (
                                            <Typography color="textSecondary">No actions available</Typography>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default ManageExtensionRequests;