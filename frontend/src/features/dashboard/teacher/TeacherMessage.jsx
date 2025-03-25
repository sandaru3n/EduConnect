import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Box, TextField, List, ListItem, ListItemText, Typography, Paper, Button, Tabs, Tab,
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

  return (
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
  );
};

export default TeacherMessaging;