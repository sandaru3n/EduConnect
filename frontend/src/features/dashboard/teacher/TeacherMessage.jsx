//frontend/src/features/dashboard/teacher/TeacherMessage.jsx
import { useState, useEffect } from "react";
import { Breadcrumbs, Link as MuiLink, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import StudentSidebar from "../../../components/TeacherSidebar/index";
import StudentHeader from "../../../components/TeacherHeader/index";

import { useCallback } from 'react';
import axios from 'axios';
import {
  Box, TextField, List, ListItem, ListItemText,Paper, Button, Tabs, Tab,
} from '@mui/material';
import debounce from 'lodash/debounce';

const TeacherMessaging = () => {

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [tabValue, setTabValue] = useState(1);
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  const currentUserId = userInfo?._id;
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Fetch conversations and received messages
  const fetchData = useCallback(async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const [convResponse, receivedResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/messages/conversations', config),
        axios.get('http://localhost:5000/api/messages/received', config),
      ]);
      setConversations(convResponse.data);
      setReceivedMessages(receivedResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [userInfo.token]);

  // Initial fetch and polling
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, [fetchData]);

  // Fetch messages for selected user
  useEffect(() => {
    if (selectedUser) {
      const fetchMessages = async () => {
        try {
          const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
          const { data } = await axios.get(
            `http://localhost:5000/api/messages/conversation/${selectedUser._id}`,
            config
          );
          setMessages(data);
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };
      fetchMessages();
    }
  }, [selectedUser, userInfo.token]);

  // Debounced search for enrolled students
  const handleSearch = useCallback(
    debounce(async (query) => {
      if (query.length < 1) {
        setSearchResults([]);
        return;
      }
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get(
          `http://localhost:5000/api/messages/search/my-students?name=${query}`,
          config
        );
        setSearchResults(data);
      } catch (error) {
        console.error('Error searching students:', error);
      }
    }, 300),
    [userInfo.token]
  );

  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery, handleSearch]);

  // Send a message
  const sendMessage = async () => {
    if (!newMessage || !selectedUser) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.post(
        'http://localhost:5000/api/messages',
        { recipientId: selectedUser._id, content: newMessage },
        config
      );
      setMessages((prev) => [...prev, data]);
      setNewMessage('');
      fetchData(); // Refresh conversations and received messages
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setSelectedUser(null);
    setSearchQuery(''); // Clear search when switching tabs
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
          <Box sx={{ display: 'flex', height: '80vh', maxWidth: 1200, mx: 'auto', p: 3 }}>
      {/* Sidebar */}
      <Box sx={{ width: '30%', borderRight: '1px solid #ccc', pr: 2 }}>
        <TextField
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search students"
          sx={{ mb: 2 }}
        />
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab label="Conversations" />
          <Tab label="Received" />
        </Tabs>
        {searchResults.length > 0 ? (
          <List>
            {searchResults.map((user) => (
              <ListItem
                button
                key={user._id}
                onClick={() => {
                  setSelectedUser(user);
                  setSearchResults([]);
                }}
              >
                <ListItemText primary={user.name} secondary={user.email} />
              </ListItem>
            ))}
          </List>
        ) : tabValue === 0 ? (
          <List>
            {conversations.map((conv) => (
              <ListItem button key={conv.user._id} onClick={() => setSelectedUser(conv.user)}>
                <ListItemText primary={conv.user.name} secondary={conv.lastMessage.content} />
              </ListItem>
            ))}
          </List>
        ) : (
          <List>
            {receivedMessages.map((msg) => (
              <ListItem
                button
                key={msg._id}
                onClick={() => setSelectedUser({ _id: msg.sender._id, name: msg.sender.name })}
                sx={{
                  backgroundColor: '#f0f8ff', // Light blue highlight for received messages
                  borderLeft: '4px solid #1976d2', // Blue border to emphasize
                  mb: 1,
                  '&:hover': { backgroundColor: '#e0f0ff' },
                }}
              >
                <ListItemText
                  primary={msg.sender.name}
                  secondary={msg.content}
                  primaryTypographyProps={{ fontWeight: 'bold' }} // Bold sender name
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Chat Window */}
      <Box sx={{ width: '70%', pl: 2 }}>
        {selectedUser ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Chat with {selectedUser.name}
            </Typography>
            <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2 }}>
              {messages.map((msg) => (
                <Paper
                  key={msg._id}
                  sx={{
                    p: 1,
                    mb: 1,
                    maxWidth: '70%',
                    alignSelf: msg.sender._id === currentUserId ? 'flex-end' : 'flex-start',
                    backgroundColor: msg.sender._id === currentUserId ? '#e3f2fd' : '#f5f5f5',
                    border: msg.sender._id !== currentUserId ? '2px solid #1976d2' : 'none', // Highlight received in chat
                  }}
                >
                  <Typography variant="body2">{msg.sender.name}</Typography>
                  <Typography variant="body1">{msg.content}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {new Date(msg.timestamp).toLocaleString()}
                  </Typography>
                </Paper>
              ))}
            </Box>
            <Box sx={{ display: 'flex' }}>
              <TextField
                fullWidth
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message"
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <Button variant="contained" onClick={sendMessage} sx={{ ml: 1 }}>
                Send
              </Button>
            </Box>
          </Box>
        ) : (
          <Typography>Select a student or message to start chatting</Typography>
        )}
      </Box>
    </Box>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherMessaging;