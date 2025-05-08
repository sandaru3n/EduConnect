import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
    Box,
    Typography,
    Paper,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Alert,
    Divider,
    List,
    ListItem,
    ListItemText,
    createTheme,
    ThemeProvider,
    Breadcrumbs,
    Link as MuiLink,
    CircularProgress
} from "@mui/material";
import useAuth from "../../../hooks/useAuth";
import AdminHeader from "../../../components/AdminHeader/index";
import AdminSidebar from "../../../components/AdminSidebar/index";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// Create a custom MUI theme to apply the Roboto font globally
const theme = createTheme({
    typography: {
        fontFamily: 'Roboto, sans-serif',
        h4: {
            fontWeight: 600,
            color: '#1a202c',
        },
        h5: {
            fontWeight: 600,
            color: '#1a202c',
        },
        body1: {
            fontWeight: 400,
            color: '#6b7280',
        },
    },
    components: {
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor: '#e5e7eb',
                        },
                        '&:hover fieldset': {
                            borderColor: '#d1d5db',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#3b82f6',
                        },
                    },
                    '& .MuiInputLabel-root': {
                        color: '#6b7280',
                        fontWeight: 500,
                    },
                },
            },
        },
        MuiSelect: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                            borderColor: '#e5e7eb',
                        },
                        '&:hover fieldset': {
                            borderColor: '#d1d5db',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#3b82f6',
                        },
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 8,
                    padding: '8px 16px',
                    fontWeight: 500,
                    fontSize: '1rem',
                    '&:hover': {
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    },
                },
            },
        },
        MuiListItem: {
            styleOverrides: {
                root: {
                    borderRadius: 2,
                    marginBottom: 8,
                    padding: '12px 16px',
                },
            },
        },
    },
});

const AdminSupportTicketDetails = () => {
    const { user } = useAuth();
    const { ticketId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [ticket, setTicket] = useState(null);
    const [status, setStatus] = useState("");
    const [newMessage, setNewMessage] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const fetchTicket = async () => {
            setLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`http://localhost:5000/api/auth/admin/support/ticket/${ticketId}`, config);
                setTicket(data);
                setStatus(data.status);
            } catch (err) {
                setError(err.response?.data?.message || "Error loading support ticket");
            } finally {
                setLoading(false);
            }
        };
        fetchTicket();
    }, [ticketId, user.token]);

    const handleStatusChange = async () => {
        setError(null);
        setSuccess(null);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(
                `http://localhost:5000/api/auth/admin/support/ticket/${ticketId}/status`,
                { status },
                config
            );
            setSuccess(data.message);
            setTicket(data.ticket);
        } catch (err) {
            setError(err.response?.data?.message || "Error updating status");
        }
    };

    const handleSendMessage = async () => {
        setError(null);
        setSuccess(null);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post(
                `http://localhost:5000/api/auth/admin/support/ticket/${ticketId}/message`,
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

    const handleContact = () => {
        window.location.href = `mailto:${ticket?.email}?subject=Support Ticket #${ticketId.slice(-4)}`;
    };

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
        const displayName = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');

        return last ? (
            <Typography
                key={to}
                sx={{
                    color: '#1f2937',
                    fontWeight: 'medium',
                    fontSize: { xs: '0.9rem', md: '1rem' },
                }}
            >
                {displayName} #{ticketId?.slice(-4)}
            </Typography>
        ) : (
            <MuiLink
                key={to}
                component={Link}
                to={to}
                underline="none"
                sx={{
                    color: '#3b82f6',
                    fontWeight: 500,
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    '&:hover': {
                        textDecoration: 'underline',
                    },
                }}
            >
                {displayName}
            </MuiLink>
        );
    });

    return (
        
            <div className="bg-gray-50 min-h-screen flex flex-col">
                <AdminHeader
                    isSidebarCollapsed={isSidebarCollapsed}
                    toggleSidebar={toggleSidebar}
                    isMobile={isMobile}
                />
                <div className="flex flex-1 overflow-hidden">
                    <div
                        className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 ${
                            isSidebarCollapsed ? "w-[60px]" : "w-[18%] md:w-[250px]"
                        }`}
                    >
                        <AdminSidebar
                            isCollapsed={isSidebarCollapsed}
                            toggleSidebar={toggleSidebar}
                        />
                    </div>

                    <main
                        className={`flex-1 transition-all duration-300 ${
                            isSidebarCollapsed ? "ml-[60px]" : "ml-[20%] md:ml-[280px]"
                        } flex flex-col`}
                    >
                        <div
                            className={`py-3 px-4 md:px-6 fixed top-[64px] right-2 z-30 transition-all duration-300 ${
                                isSidebarCollapsed ? "ml-[60px] w-[calc(100%-60px)]" : "ml-[18%] w-[calc(100%-18%)] md:ml-[250px] md:w-[calc(100%-250px)]"
                            } bg-white border-b border-gray-200 shadow-sm`}
                        >
                            <Breadcrumbs
                                aria-label="breadcrumb"
                                separator={<span className="text-gray-400 mx-1">{'>'}</span>}
                                sx={{
                                    '& .MuiBreadcrumbs-ol': {
                                        alignItems: 'center',
                                    },
                                }}
                            >
                                {breadcrumbItems}
                            </Breadcrumbs>
                        </div>

                        <div className="mt-[120px] p-4 md:p-6 overflow-y-auto h-[calc(100vh-120px)]">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                sx={{ maxWidth: 900, mx: "auto" }}
                            >
                                <Paper elevation={3} sx={{ p: 4, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                                    {loading ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                                            <CircularProgress />
                                            <Typography variant="body1" color="text.secondary" sx={{ ml: 2, fontSize: '1rem' }}>
                                                Loading ticket...
                                            </Typography>
                                        </Box>
                                    ) : !ticket ? (
                                        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem' }}>
                                            No ticket found.
                                        </Typography>
                                    ) : (
                                        <>
                                            <Typography variant="h4" gutterBottom sx={{ mb: 4, fontSize: { xs: '1.5rem', md: '2rem' } }}>
                                                Ticket #{ticketId.slice(-4)}
                                            </Typography>
                                            {error && (
                                                <Alert severity="error" sx={{ mb: 3, borderRadius: 2, fontSize: '1rem' }}>
                                                    {error}
                                                </Alert>
                                            )}
                                            {success && (
                                                <Alert severity="success" sx={{ mb: 3, borderRadius: 2, fontSize: '1rem' }}>
                                                    {success}
                                                </Alert>
                                            )}
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="body1" sx={{ mb: 1, fontSize: '1rem' }}>
                                                    <strong>Subject:</strong> {ticket.subcategoryId?.name || "N/A"}
                                                </Typography>
                                                <Typography variant="body1" sx={{ mb: 1, fontSize: '1rem' }}>
                                                    <strong>User:</strong> {ticket.userId?.name || "Guest"} ({ticket.userRole})
                                                </Typography>
                                                <Typography variant="body1" sx={{ mb: 1, fontSize: '1rem' }}>
                                                    <strong>Email:</strong> {ticket.email}
                                                </Typography>
                                                <Typography variant="body1" sx={{ mb: 1, fontSize: '1rem' }}>
                                                    <strong>Category:</strong> {ticket.categoryId?.name || "N/A"}
                                                </Typography>
                                                <Typography variant="body1" sx={{ mb: 1, fontSize: '1rem' }}>
                                                    <strong>Subcategory:</strong> {ticket.subcategoryId?.name || "N/A"}
                                                </Typography>
                                                <Typography variant="body1" sx={{ mb: 1, fontSize: '1rem' }}>
                                                    <strong>Message:</strong> {ticket.message}
                                                </Typography>
                                                <Typography variant="body1" sx={{ mb: 1, fontSize: '1rem' }}>
                                                    <strong>Date:</strong> {new Date(ticket.createdAt).toLocaleString()}
                                                </Typography>
                                                <Typography variant="body1" sx={{ mb: 2, fontSize: '1rem' }}>
                                                    <strong>Last Updated:</strong> {new Date(ticket.updatedAt).toLocaleString()}
                                                </Typography>
                                            </Box>

                                            <Box sx={{ display: 'flex', gap: 2, mb: 4, alignItems: 'center' }}>
                                                <FormControl sx={{ minWidth: 200 }}>
                                                    <InputLabel>Status</InputLabel>
                                                    <Select
                                                        value={status}
                                                        onChange={(e) => setStatus(e.target.value)}
                                                        label="Status"
                                                        sx={{
                                                            bgcolor: '#f9fafb',
                                                            borderRadius: 1,
                                                            '& .MuiOutlinedInput-root': {
                                                                py: 1,
                                                                fontSize: '1rem',
                                                            },
                                                        }}
                                                    >
                                                        <MenuItem value="Open">Open</MenuItem>
                                                        <MenuItem value="Responded">Responded</MenuItem>
                                                        <MenuItem value="Closed">Closed</MenuItem>
                                                    </Select>
                                                </FormControl>
                                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        onClick={handleStatusChange}
                                                        sx={{
                                                            bgcolor: '#3b82f6',
                                                            '&:hover': {
                                                                bgcolor: '#2563eb',
                                                            },
                                                            px: 4,
                                                            py: 1.5,
                                                        }}
                                                    >
                                                        Update Status
                                                    </Button>
                                                </motion.div>
                                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                    <Button
                                                        variant="contained"
                                                        color="secondary"
                                                        onClick={handleContact}
                                                        sx={{
                                                            bgcolor: '#10b981',
                                                            '&:hover': {
                                                                bgcolor: '#059669',
                                                            },
                                                            px: 4,
                                                            py: 1.5,
                                                        }}
                                                    >
                                                        Contact
                                                    </Button>
                                                </motion.div>
                                            </Box>

                                            <Divider sx={{ my: 4, borderColor: '#e5e7eb' }} />

                                            <Typography variant="h5" gutterBottom sx={{ mb: 2, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                                                Conversation
                                            </Typography>
                                            {ticket.messages.length > 0 ? (
                                                <List sx={{ maxHeight: 300, overflowY: "auto", mb: 3, bgcolor: '#f9fafb', borderRadius: 2, p: 2 }}>
                                                    {ticket.messages.map((msg, index) => (
                                                        <ListItem
                                                            key={index}
                                                            sx={{
                                                                flexDirection: msg.senderRole === "admin" ? "row-reverse" : "row",
                                                                bgcolor: msg.senderRole === "admin" ? '#e0f2fe' : '#e5e7eb',
                                                                '&:hover': {
                                                                    bgcolor: msg.senderRole === "admin" ? '#bfdbfe' : '#d1d5db',
                                                                },
                                                            }}
                                                        >
                                                            <ListItemText
                                                                primary={msg.content}
                                                                secondary={`${msg.senderRole.charAt(0).toUpperCase() + msg.senderRole.slice(1)} • ${new Date(msg.createdAt).toLocaleString()}`}
                                                                sx={{
                                                                    textAlign: msg.senderRole === "admin" ? "right" : "left",
                                                                    '& .MuiListItemText-primary': {
                                                                        fontSize: '1rem',
                                                                        color: '#1a202c',
                                                                    },
                                                                    '& .MuiListItemText-secondary': {
                                                                        fontSize: '0.85rem',
                                                                        color: '#6b7280',
                                                                    },
                                                                }}
                                                            />
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            ) : (
                                                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontSize: '1rem' }}>
                                                    No messages yet.
                                                </Typography>
                                            )}

                                            <TextField
                                                fullWidth
                                                label="Write a message"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                variant="outlined"
                                                multiline
                                                rows={3}
                                                sx={{
                                                    mb: 3,
                                                    bgcolor: '#f9fafb',
                                                    borderRadius: 1,
                                                    '& .MuiOutlinedInput-root': {
                                                        py: 1,
                                                        fontSize: '1rem',
                                                    },
                                                }}
                                            />
                                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={handleSendMessage}
                                                    disabled={!newMessage || loading}
                                                    sx={{
                                                        bgcolor: '#3b82f6',
                                                        '&:hover': {
                                                            bgcolor: '#2563eb',
                                                        },
                                                        px: 4,
                                                        py: 1.5,
                                                    }}
                                                >
                                                    Send
                                                </Button>
                                            </motion.div>
                                        </>
                                    )}
                                </Paper>
                            </motion.div>
                        </div>
                    </main>
                </div>
            </div>
        
    );
};

export default AdminSupportTicketDetails;