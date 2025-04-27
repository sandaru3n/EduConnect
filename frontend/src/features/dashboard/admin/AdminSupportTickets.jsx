import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
    Tabs,
    Tab
} from "@mui/material";
import useAuth from "../../../hooks/useAuth";

const AdminSupportTickets = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        const fetchTickets = async () => {
            setLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get("http://localhost:5000/api/auth/admin/support/tickets", config);
                setTickets(data);
                setFilteredTickets(data.filter(ticket => ticket.status === "Open"));
            } catch (err) {
                setError(err.response?.data?.message || "Error loading support tickets");
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, [user.token]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        if (newValue === 0) {
            setFilteredTickets(tickets.filter(ticket => ticket.status === "Open"));
        } else if (newValue === 1) {
            setFilteredTickets(tickets.filter(ticket => ticket.status === "Responded"));
        } else {
            setFilteredTickets(tickets.filter(ticket => ticket.status === "Closed"));
        }
    };

    const handleDelete = async (ticketId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`http://localhost:5000/api/auth/admin/support/ticket/${ticketId}`, config);
            setTickets(tickets.filter(ticket => ticket._id !== ticketId));
            setFilteredTickets(filteredTickets.filter(ticket => ticket._id !== ticketId));
        } catch (err) {
            setError(err.response?.data?.message || "Error deleting support ticket");
        }
    };

    const getLatestMessageSubject = (ticket) => {
        if (ticket.messages.length > 0) {
            const latestMessage = ticket.messages[ticket.messages.length - 1];
            return latestMessage.content.length > 50 
                ? latestMessage.content.substring(0, 50) + "..." 
                : latestMessage.content;
        }
        return ticket.subcategoryId?.name || "N/A";
    };

    return (
        <Box sx={{ maxWidth: 1200, mx: "auto", p: 3, mt: "50px" }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h4" gutterBottom>Support Tickets</Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
                    <Tab label={`Open (${tickets.filter(t => t.status === "Open").length})`} />
                    <Tab label={`Responded (${tickets.filter(t => t.status === "Responded").length})`} />
                    <Tab label={`Closed (${tickets.filter(t => t.status === "Closed").length})`} />
                </Tabs>
                {loading ? (
                    <Typography variant="body1" color="text.secondary">Loading tickets...</Typography>
                ) : filteredTickets.length > 0 ? (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Id</TableCell>
                                    <TableCell>Subject</TableCell>
                                    <TableCell>User</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Updated</TableCell>
                                    <TableCell>Options</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredTickets.map((ticket) => (
                                    <TableRow key={ticket._id}>
                                        <TableCell>#{ticket._id.slice(-4)}</TableCell>
                                        <TableCell>{getLatestMessageSubject(ticket)}</TableCell>
                                        <TableCell>{ticket.userId?.name || "Guest"}</TableCell>
                                        <TableCell>{ticket.status}</TableCell>
                                        <TableCell>{new Date(ticket.createdAt).toLocaleString()}</TableCell>
                                        <TableCell>{new Date(ticket.updatedAt).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                size="small"
                                                onClick={() => navigate(`/admin/support/ticket/${ticket._id}`)}
                                                sx={{ mr: 1 }}
                                            >
                                                Show
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                size="small"
                                                onClick={() => handleDelete(ticket._id)}
                                            >
                                                Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Typography variant="body1" color="text.secondary">
                        No tickets available for this statussubstring.
                    </Typography>
                )}
            </Paper>
        </Box>
    );
};

export default AdminSupportTickets;