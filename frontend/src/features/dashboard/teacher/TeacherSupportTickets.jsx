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

const TeacherSupportTickets = () => {
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
                const { data } = await axios.get("http://localhost:5000/api/auth/support/tickets", config);
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
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(`/${user.role}/support-form`)}
                    sx={{ mb: 2 }}
                >
                    Submit New Ticket
                </Button>
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
                                        <TableCell>{ticket.status}</TableCell>
                                        <TableCell>{new Date(ticket.createdAt).toLocaleString()}</TableCell>
                                        <TableCell>{new Date(ticket.updatedAt).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                size="small"
                                                onClick={() => navigate(`/${user.role}/support/ticket/${ticket._id}`)}
                                            >
                                                Show
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Typography variant="body1" color="text.secondary">
                        No tickets available for this status.
                    </Typography>
                )}
            </Paper>
        </Box>
    );
};

export default TeacherSupportTickets;