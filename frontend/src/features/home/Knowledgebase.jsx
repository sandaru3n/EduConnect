import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const Knowledgebase = () => {
  const [articles, setArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/knowledgebase');
        setArticles(data);
      } catch (error) {
        console.error('Error fetching knowledgebase articles:', error);
      }
    };
    fetchArticles();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.get(`http://localhost:5000/api/knowledgebase/search?query=${searchQuery}`);
      setArticles(data);
    } catch (error) {
      console.error('Error searching articles:', error);
    }
  };

  // Group articles by category and count them
  const categories = [...new Set(articles.map(article => article.category))];
  const categoryCounts = categories.map(category => ({
    name: category,
    count: articles.filter(article => article.category === category).length,
  }));

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
        How can we help?
      </Typography>

      {/* Search Bar */}
      <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <TextField
          placeholder="Search Beacon, Docs, Reports, etc"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: '50%', mr: 1 }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'gray' }} />,
          }}
        />
        <Button type="submit" variant="contained" color="primary">
          Search
        </Button>
      </Box>

      {/* Categories Section */}
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mt: 4 }}>
        Getting Started
      </Typography>
      <Grid container spacing={3}>
        {categoryCounts.map((category, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ minHeight: 150, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {category.name.toUpperCase()}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  {category.name === 'Set Up Your Account' && 'Get to know Inbox, Beacon, and Docs, and get your emails forwarding'}
                  {category.name === 'Work With Your Team' && 'Administration tips and collaboration tools'}
                  {category.name === 'Explore Proactive Messages' && 'Let us improve your customer outreach with some cases and'}
                  {category.name === 'Self Service Best Practices' && 'Help your customers help themselves'}
                </Typography>
              </CardContent>
              <CardActions>
                <Typography variant="body2" color="textSecondary">
                  {category.count} articles
                </Typography>
              </CardActions>
            </Card>
          </Grid>
        ))}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ minHeight: 150, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Button variant="contained" color="primary" onClick={() => navigate('/contact')}>
              Contact Us
            </Button>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Knowledgebase;