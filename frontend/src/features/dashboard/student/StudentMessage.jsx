//frontend/src/features/dashboard/student/StudentMessage.jsx
import StudentSidebar from "../../../components/StudentSidebar/index";
import StudentHeader from "../../../components/StudentHeader/index";
import { Breadcrumbs, Link as MuiLink, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Box, TextField, List, ListItem, ListItemText, Paper, Button, Tabs, Tab } from '@mui/material';
import debounce from 'lodash/debounce';

const StudentMessaging = () => {
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

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, [fetchData]);

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

    const handleSearch = useCallback(
        debounce(async (query) => {
            if (query.length < 1) {
                setSearchResults([]);
                return;
            }
            try {
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get(
                    `http://localhost:5000/api/messages/search/teachers?name=${query}`,
                    config
                );
                setSearchResults(data);
            } catch (error) {
                console.error('Error searching teachers:', error);
            }
        }, 300),
        [userInfo.token]
    );

    useEffect(() => {
        handleSearch(searchQuery);
    }, [searchQuery, handleSearch]);

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
            fetchData();
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        setSelectedUser(null);
        setSearchQuery('');
    };

    const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

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
        const displayName = value.charAt(0).toUpperCase() + value.slice(1);

        return last ? (
            <Typography key={to} className="font-semibold text-purple-900">
                {displayName}
            </Typography>
        ) : (
            <MuiLink
                key={to}
                component={Link}
                to={to}
                className="text-teal-600 hover:text-teal-800 transition-colors duration-200"
            >
                {displayName}
            </MuiLink>
        );
    });

    const pageTitle = pathnames.length > 0 
        ? pathnames[pathnames.length - 1].charAt(0).toUpperCase() + pathnames[pathnames.length - 1].slice(1)
        : "Dashboard";

    useEffect(() => {
        document.title = `${pageTitle} - Student Dashboard - EduConnect`;
    }, [location, pageTitle]);

    return (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen flex flex-col font-sans antialiased">
            <StudentHeader 
                isSidebarCollapsed={isSidebarCollapsed}
                toggleSidebar={toggleSidebar}
                isMobile={isMobile}
                className="sticky top-0 z-50 bg-gradient-to-r from-teal-600 to-indigo-600 text-white shadow-lg border-b border-teal-700"
            />
            
            <div className="flex flex-1 overflow-hidden">
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

                <main
                    className={`flex-1 transition-all duration-300 ${
                        isSidebarCollapsed ? "ml-16" : "ml-64 md:ml-72"
                    } p-4 md:p-8 flex flex-col`}
                >
                    <div className="bg-white p-6 rounded-xl shadow-md mb-8 mt-16 border border-purple-200 sticky top-0 z-30">
                        <Breadcrumbs aria-label="breadcrumb" className="text-sm md:text-base text-gray-700">
                            <MuiLink
                                component={Link}
                                to="/student"
                                className="text-teal-600 hover:text-teal-800 font-medium transition-colors duration-200"
                            >
                                Student
                            </MuiLink>
                            {breadcrumbItems}
                        </Breadcrumbs>
                    </div>

                    <div className="flex-1 max-w-6xl  flex flex-row bg-white rounded-xl shadow-md border border-teal-200 overflow-hidden">
                        {/* Sidebar */}
                        <div className="w-1/4 border-r border-purple-300 p-4 flex flex-col h-full bg-gradient-to-b from-teal-50 to-indigo-50">
                            <TextField
                                fullWidth
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search teachers"
                                className="mb-4 rounded-md border-teal-300 focus:ring-teal-500 focus:border-teal-500 bg-white"
                                InputProps={{ className: "text-gray-800" }}
                            />
                            <Tabs
                                value={tabValue}
                                onChange={handleTabChange}
                                className="mb-4"
                                TabIndicatorProps={{ className: "bg-purple-600" }}
                            >
                                <Tab label="Conversations" className="text-teal-700 hover:text-teal-900" />
                                <Tab label="Received" className="text-indigo-700 hover:text-indigo-900" />
                            </Tabs>
                            <div className="flex-1 overflow-y-auto">
                                {searchResults.length > 0 ? (
                                    <List>
                                        {searchResults.map((user) => (
                                            <ListItem
                                                key={user._id}
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setSearchResults([]);
                                                }}
                                                className="cursor-pointer rounded-md hover:bg-teal-100 transition-colors duration-200"
                                            >
                                                <ListItemText
                                                    primary={user.name}
                                                    secondary={user.email}
                                                    primaryTypographyProps={{ className: "text-teal-900 font-medium" }}
                                                    secondaryTypographyProps={{ className: "text-indigo-600 truncate" }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                ) : tabValue === 0 ? (
                                    <List>
                                        {conversations.length > 0 ? (
                                            conversations.map((conv) => (
                                                <ListItem
                                                    key={conv.user._id}
                                                    onClick={() => setSelectedUser(conv.user)}
                                                    className="cursor-pointer rounded-md hover:bg-teal-100 transition-colors duration-200"
                                                >
                                                    <ListItemText
                                                        primary={conv.user.name}
                                                        secondary={conv.lastMessage.content}
                                                        primaryTypographyProps={{ className: "text-teal-900 font-medium" }}
                                                        secondaryTypographyProps={{ className: "text-indigo-600 truncate" }}
                                                    />
                                                </ListItem>
                                            ))
                                        ) : (
                                            <Typography className="text-purple-500 italic p-2">No previous conversations</Typography>
                                        )}
                                    </List>
                                ) : (
                                    <List>
                                        {receivedMessages.map((msg) => (
                                            <ListItem
                                                key={msg._id}
                                                onClick={() => setSelectedUser({ _id: msg.sender._id, name: msg.sender.name })}
                                                className="cursor-pointer rounded-md bg-purple-50 border-l-4 border-teal-600 hover:bg-purple-100 transition-colors duration-200 mb-2"
                                            >
                                                <ListItemText
                                                    primary={msg.sender.name}
                                                    secondary={msg.content}
                                                    primaryTypographyProps={{ className: "text-teal-900 font-semibold" }}
                                                    secondaryTypographyProps={{ className: "text-indigo-700 truncate" }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                )}
                            </div>
                        </div>

                        {/* Chat Window */}
                        <div className="w-3/4 p-4 flex flex-col h-full bg-gradient-to-br from-indigo-50 to-teal-50">
                            {selectedUser ? (
                                <div className="flex flex-col h-full">
                                    <Typography variant="h6" className="text-xl font-semibold text-purple-900 mb-4">
                                        Chat with {selectedUser.name}
                                    </Typography>
                                    <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                                        {messages.map((msg) => (
                                            <Paper
                                                key={msg._id}
                                                className={`p-3 rounded-lg max-w-[70%] shadow-sm ${
                                                    msg.sender._id === currentUserId
                                                        ? "ml-auto bg-teal-200 text-teal-900 border border-teal-400"
                                                        : "mr-auto bg-purple-100 text-purple-900 border border-purple-400"
                                                }`}
                                            >
                                                <Typography variant="body2" className="font-medium">
                                                    {msg.sender.name}
                                                </Typography>
                                                <Typography variant="body1" className="mt-1">
                                                    {msg.content}
                                                </Typography>
                                                <Typography variant="caption" className="text-indigo-600 mt-1">
                                                    {new Date(msg.timestamp).toLocaleString()}
                                                </Typography>
                                            </Paper>
                                        ))}
                                    </div>
                                    <div className="flex items-center">
                                        <TextField
                                            fullWidth
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type a message"
                                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                            className="rounded-md border-teal-300 focus:ring-teal-500 focus:border-teal-500 bg-white"
                                            InputProps={{ className: "text-gray-800" }}
                                        />
                                        <Button
                                            variant="contained"
                                            onClick={sendMessage}
                                            className="ml-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
                                        >
                                            Send
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-center">
                                    <Typography className="text-indigo-500 text-lg">
                                        Select a teacher or message to start chatting
                                    </Typography>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default StudentMessaging;
