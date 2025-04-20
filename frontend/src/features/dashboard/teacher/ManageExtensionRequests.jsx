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
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TableSortLabel
} from "@mui/material";

const ManageExtensionRequests = () => {
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [filter, setFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('asc');

    useEffect(() => {
        fetchRequests();
    }, []);

    useEffect(() => {
        // Apply filter and sort
        let updatedRequests = [...requests];
        if (filter !== 'all') {
            updatedRequests = requests.filter(req => req.status === filter);
        }
        updatedRequests.sort((a, b) => {
            const statusOrder = { pending: 1, approved: 2, rejected: 3 };
            const order = sortOrder === 'asc' ? 1 : -1;
            return order * (statusOrder[a.status] - statusOrder[b.status]);
        });
        setFilteredRequests(updatedRequests);
    }, [requests, filter, sortOrder]);

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

    const handleSort = () => {
        setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    };

    return (
        <Box sx={{ maxWidth: 1000, mx: "auto", p: 3 }}>
            <Typography variant="h4" gutterBottom>Manage Extension Requests</Typography>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Filter by Status</InputLabel>
                    <Select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        label="Filter by Status"
                    >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="approved">Approved</MenuItem>
                        <MenuItem value="rejected">Rejected</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            {filteredRequests.length === 0 ? (
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
                                <TableCell>
                                    <TableSortLabel
                                        active
                                        direction={sortOrder}
                                        onClick={handleSort}
                                    >
                                        Status
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredRequests.map(request => (
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