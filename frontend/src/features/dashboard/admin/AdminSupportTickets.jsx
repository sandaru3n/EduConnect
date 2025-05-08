import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
    Tab,
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
        body1: {
            fontWeight: 400,
            color: '#6b7280',
        },
    },
    components: {
        MuiTabs: {
            styleOverrides: {
                root: {
                    borderBottom: '1px solid #e5e7eb',
                },
                indicator: {
                    backgroundColor: '#3b82f6',
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 500,
                    color: '#6b7280',
                    '&.Mui-selected': {
                        color: '#3b82f6',
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    '&:hover': {
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    },
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    fontWeight: 600,
                    color: '#1a202c',
                    backgroundColor: '#f9fafb',
                },
                body: {
                    color: '#6b7280',
                    fontSize: '1rem',
                },
            },
        },
    },
});

const AdminSupportTickets = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [tickets, setTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

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
                {displayName}
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
                                sx={{ maxWidth: 1200, mx: "auto" }}
                            >
                                <Paper elevation={3} sx={{ p: 4, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                                    <Typography variant="h4" gutterBottom sx={{ mb: 4, fontSize: { xs: '1.5rem', md: '2rem' } }}>
                                        Support Tickets
                                    </Typography>
                                    {error && (
                                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2, fontSize: '1rem' }}>
                                            {error}
                                        </Alert>
                                    )}
                                    <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 4 }}>
                                        <Tab label={`Open (${tickets.filter(t => t.status === "Open").length})`} />
                                        <Tab label={`Responded (${tickets.filter(t => t.status === "Responded").length})`} />
                                        <Tab label={`Closed (${tickets.filter(t => t.status === "Closed").length})`} />
                                    </Tabs>
                                    {loading ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                                            <CircularProgress />
                                            <Typography variant="body1" color="text.secondary" sx={{ ml: 2, fontSize: '1rem' }}>
                                                Loading tickets...
                                            </Typography>
                                        </Box>
                                    ) : filteredTickets.length > 0 ? (
                                        <TableContainer sx={{ borderRadius: 2, overflow: 'hidden' }}>
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
                                                        <TableRow
                                                            key={ticket._id}
                                                            sx={{
                                                                '&:hover': {
                                                                    bgcolor: '#f9fafb',
                                                                },
                                                            }}
                                                        >
                                                            <TableCell>#{ticket._id.slice(-4)}</TableCell>
                                                            <TableCell>{getLatestMessageSubject(ticket)}</TableCell>
                                                            <TableCell>{ticket.userId?.name || "Guest"}</TableCell>
                                                            <TableCell>{ticket.status}</TableCell>
                                                            <TableCell>{new Date(ticket.createdAt).toLocaleString()}</TableCell>
                                                            <TableCell>{new Date(ticket.updatedAt).toLocaleString()}</TableCell>
                                                            <TableCell>
                                                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ display: 'inline-block', marginRight: 8 }}>
                                                                    <Button
                                                                        variant="outlined"
                                                                        color="primary"
                                                                        size="small"
                                                                        onClick={() => navigate(`/admin/support/ticket/${ticket._id}`)}
                                                                        sx={{
                                                                            borderColor: '#3b82f6',
                                                                            color: '#3b82f6',
                                                                            '&:hover': {
                                                                                bgcolor: '#e0f2fe',
                                                                                borderColor: '#3b82f6',
                                                                            },
                                                                        }}
                                                                    >
                                                                        Show
                                                                    </Button>
                                                                </motion.div>
                                                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ display: 'inline-block' }}>
                                                                    <Button
                                                                        variant="outlined"
                                                                        color="error"
                                                                        size="small"
                                                                        onClick={() => handleDelete(ticket._id)}
                                                                        sx={{
                                                                            borderColor: '#ef4444',
                                                                            color: '#ef4444',
                                                                            '&:hover': {
                                                                                bgcolor: '#fee2e2',
                                                                                borderColor: '#ef4444',
                                                                            },
                                                                        }}
                                                                    >
                                                                        Delete
                                                                    </Button>
                                                                </motion.div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    ) : (
                                        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1rem' }}>
                                            No tickets available for this status.
                                        </Typography>
                                    )}
                                </Paper>
                            </motion.div>
                        </div>
                    </main>
                </div>
            </div>
        
    );
};

export default AdminSupportTickets;