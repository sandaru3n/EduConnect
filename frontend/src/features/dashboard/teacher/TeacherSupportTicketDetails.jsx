import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
    Box,
    Typography,
    Paper,
    TextField,
    Button,
    Alert,
    Divider,
    List,
    ListItem,
    ListItemText
} from "@mui/material";
import useAuth from "../../../hooks/useAuth";

const TeacherSupportTicketDetails = () => {
    const { user } = useAuth();
    const { ticketId } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchTicket = async () => {
            setLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`http://localhost:5000/api/auth/support/ticket/${ticketId}`, config);
                setTicket(data);
            } catch (err) {
                setError(err.response?.data?.message || "Error loading support ticket");
            } finally {
                setLoading(false);
            }
        };
        fetchTicket();
    }, [ticketId, user.token]);

    const handleSendMessage = async () => {
        setError(null);
        setSuccess(null);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post(
                `http://localhost:5000/api/auth/support/ticket/${ticketId}/message`,
                { content: newMessage },
                config
            );
            setSuccess(data.message);
            setTicket(data.ticket);
            setNewMessage("");
        } catch (err) {
            setError(err.response?.data?.message || "Error sending message");
        }
    };

    if (loading) {
        return <Typography>Loading...</Typography>;
    }

    if (!ticket) {
        return <Typography>No ticket found.</Typography>;
    }

    return (
        <Box sx={{ maxWidth: 800, mx: "auto", p: 3, mt: "50px" }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h4" gutterBottom>Ticket #{ticketId.slice(-4)}</Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Subject:</strong> {ticket.subcategoryId?.name || "N/A"}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Category:</strong> {ticket.categoryId?.name || "N/A"}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Subcategory:</strong> {ticket.subcategoryId?.name || "N/A"}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Message:</strong> {ticket.message}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Status:</strong> {ticket.status}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                    <strong>Date:</strong> {new Date(ticket.createdAt).toLocaleString()}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    <strong>Last Updated:</strong> {new Date(ticket.updatedAt).toLocaleString()}
                </Typography>

                <Divider sx={{ my: 3 }} />

                
<Typography variant="h5" gutterBottom>Conversation</Typography>
{ticket.messages.length > 0 ? (
    <List sx={{ maxHeight: 300, overflowY: "auto", mb: 2 }}>
        {ticket.messages.map((msg, index) => (
            <ListItem
                key={index}
                sx={{
                    flexDirection: (msg.senderRole || "user") === "admin" ? "row" : "row-reverse",
                    bgcolor: (msg.senderRole || "user") === "admin" ? "grey.200" : "primary.light",
                    borderRadius: 2,
                    mb: 1,
                    p: 1
                }}
            >
                <ListItemText
                    primary={msg.content}
                    secondary={`${(msg.senderRole || "user").charAt(0).toUpperCase() + (msg.senderRole || "user").slice(1)} • ${new Date(msg.createdAt).toLocaleString()}`}
                    sx={{ textAlign: (msg.senderRole || "user") === "admin" ? "left" : "right" }}
                />
            </ListItem>
        ))}
    </List>
) : (
    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        No messages yet.
    </Typography>
)}

                {ticket.status !== "Closed" ? (
                    <>
                        <TextField
                            fullWidth
                            label="Write a message"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            variant="outlined"
                            multiline
                            rows={3}
                            sx={{ mb: 2 }}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSendMessage}
                            disabled={!newMessage || loading}
                        >
                            Send
                        </Button>
                    </>
                ) : (
                    <Typography variant="body1" color="text.secondary">
                        This ticket is closed. You cannot send messages.
                    </Typography>
                )}
            </Paper>
        </Box>
    );
};

export default TeacherSupportTicketDetails;