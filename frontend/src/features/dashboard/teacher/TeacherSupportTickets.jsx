//frontend/src/features/dashboard/teacher/TeacherDashboard.jsx
import { useState, useEffect } from "react";
import { Breadcrumbs, Link as MuiLink, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import StudentSidebar from "../../../components/TeacherSidebar/index";
import StudentHeader from "../../../components/TeacherHeader/index";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
    Box,
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
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

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

  useEffect(() => {
    const handleResize = () => {
      const mobileView = window.innerWidth <= 768;
      setIsMobile(mobileView);
      setIsSidebarCollapsed(mobileView); // Auto-collapse on mobile
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const pathnames = location.pathname.split("/").filter((x) => x);
  const breadcrumbItems = pathnames.map((value, index) => {
    const last = index === pathnames.length - 1;
    const to = `/${pathnames.slice(0, index + 1).join("/")}`;
    const displayName = value.charAt(0).toUpperCase() + value.slice(1);

    return last ? (
      <Typography key={to} color="text.primary">
        {displayName}
      </Typography>
    ) : (
      <MuiLink
        key={to}
        component={Link}
        to={to}
        underline="hover"
        color="inherit"
      >
        {displayName}
      </MuiLink>
    );
  });

  // Get the current page name for the tab title
  const pageTitle = pathnames.length > 0 
    ? pathnames[pathnames.length - 1].charAt(0).toUpperCase() + pathnames[pathnames.length - 1].slice(1)
    : "Dashboard"; // Default title if no pathnames

  // Update document title when location changes
  useEffect(() => {
    document.title = `TeacherDashboard - EduConnect`; // You can customize the format
  }, [location, pageTitle]);

  return (
    <div>
      <StudentHeader 
        isSidebarCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        isMobile={isMobile}
      />
      
      <div className="flex min-h-screen">
        <div
          className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 ${
            isSidebarCollapsed ? "w-[60px]" : "w-[18%] md:w-[250px]"
          }`}
        >
          <StudentSidebar 
            isCollapsed={isSidebarCollapsed} 
            toggleSidebar={toggleSidebar} 
          />
        </div>

        <div
          className={`flex-1 transition-all duration-300 ${
            isSidebarCollapsed ? "ml-[60px]" : "ml-[18%] md:ml-[250px]"
          }`}
        >
          <div
            className={`mt-[50px] py-2 px-4 md:px-6 bg-gray-100 border-b fixed top-0 w-full z-30 transition-all duration-300 ${
              isSidebarCollapsed 
                ? "ml-[60px] w-[calc(100%-60px)]" 
                : "ml-[18%] w-[calc(100%-18%)] md:ml-[250px] md:w-[calc(100%-250px)]"
            }`}
          >
            {/* Breadcrumbs */}
        <div
          className={`mt-[50px] py-2 px-4 md:px-6 bg-gray-100 border-b transition-all duration-300 z-30 fixed top-0 left-0 w-full ${
            isSidebarCollapsed
              ? "ml-[60px] w-[calc(100%-60px)]"
              : "ml-[18%] w-[calc(100%-18%)] md:ml-[250px] md:w-[calc(100%-250px)]"
          }`}
        >
          <Breadcrumbs aria-label="breadcrumb">
            {breadcrumbItems}
          </Breadcrumbs>
          </div></div>
        
          
          <div className="mt-[90px] p-4 md:p-6 overflow-y-auto h-[calc(100vh-90px)]">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherSupportTickets;