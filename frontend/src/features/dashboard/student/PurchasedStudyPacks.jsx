// frontend/src/features/student/PurchasedStudyPacks.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Card, CardContent, CardMedia, Button, Grid, CircularProgress, Alert } from '@mui/material';

const PurchasedStudyPacks = () => {
  const [studyPacks, setStudyPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPurchasedStudyPacks = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get('http://localhost:5000/api/studypacks/purchased', config);
        setStudyPacks(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch purchased study packs');
        setLoading(false);
      }
    };
    fetchPurchasedStudyPacks();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>Purchased Study Packs</Typography>
      <Grid container spacing={3}>
        {studyPacks.map(pack => (
          <Grid item xs={12} sm={6} md={4} key={pack._id}>
            <Card>
              <CardMedia component="img" height="140" image={pack.coverPhotoUrl} alt={pack.title} />
              <CardContent>
                <Typography variant="h6">{pack.title}</Typography>
                <Typography variant="body2" color="textSecondary">Subject: {pack.subject}</Typography>
                <Typography variant="body2">Teacher: {pack.teacherId.name}</Typography>
                <Typography variant="subtitle1" sx={{ mt: 2 }}>Files:</Typography>
                {pack.files.map((file, index) => (
                  <Box key={index} sx={{ mt: 1 }}>
                    <Typography variant="body2">{file.lessonName} ({file.type})</Typography>
                    <Button
                      href={file.content}
                      target="_blank"
                      variant="outlined"
                      size="small"
                      sx={{ mt: 0.5 }}
                    >
                      {file.type === 'pdf' ? 'View PDF' : file.type === 'video' ? 'Watch Video' : 'Open URL'}
                    </Button>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PurchasedStudyPacks;