import { useState, useEffect } from "react";
import { Breadcrumbs, Link as MuiLink, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import InstituteSidebar from "../../../components/InstituteSidebar/index";
import InstituteHeader from "../../../components/InstituteHeader/index";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Paper,
  TextField,
  Button,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import useAuth from "../../../hooks/useAuth";

const TeacherSupportTicketDetails = () => {
  const { user } = useAuth();
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [ticket, setTicket] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Define pathnames early to avoid reference errors
  const pathnames = location.pathname.split("/").filter((x) => x);

  // Get the current page name for the tab title
  const pageTitle = pathnames.length > 0
    ? pathnames[pathnames.length - 1].charAt(0).toUpperCase() + pathnames[pathnames.length - 1].slice(1)
    : "Dashboard"; // Default title if no pathnames

  // Update document title when location changes
  useEffect(() => {
    document.title = `${pageTitle} - EduConnect`; // Updated format for clarity
  }, [location, pageTitle]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

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

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (!ticket) {
    return <Typography>No ticket found.</Typography>;
  }

  return (
    <div>
      <InstituteHeader
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
          <InstituteSidebar
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
            className={`mt-[50px] py-2 px-4 md:px-6 bg-gray-100 border-b fixed top-0 z-30 transition-all duration-300 ${
              isSidebarCollapsed
                ? "ml-[60px] w-[calc(100%-60px)]"
                : "ml-[18%] w-[calc(100%-18%)] md:ml-[250px] md:w-[calc(100%-250px)]"
            }`}
          >
            <Breadcrumbs aria-label="breadcrumb">
              <MuiLink component={Link} to="/teacher" underline="hover" color="inherit">
                Teacher
              </MuiLink>
              {breadcrumbItems}
            </Breadcrumbs>
          </div>

          <div className="mt-[90px] p-4 md:p-6 overflow-y-auto h-[calc(100vh-90px)]">
            <Box sx={{ maxWidth: 800, mx: "auto", p: 3, mt: "50px" }}>
              <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h4" gutterBottom>
                  Ticket #{ticketId.slice(-4)}
                </Typography>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                  </Alert>
                )}
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

                <Typography variant="h5" gutterBottom>
                  Conversation
                </Typography>
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
                          p: 1,
                        }}
                      >
                        <ListItemText
                          primary={msg.content}
                          secondary={`${(msg.senderRole || "user").charAt(0).toUpperCase() + (msg.senderRole || "user").slice(1)} • ${new Date(
                            msg.createdAt
                          ).toLocaleString()}`}
                          sx={{ textAlign: (msg.senderRole || "user") === "admin" ? "left" : "right" }}
                        />
                      </ ListItem>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherSupportTicketDetails;