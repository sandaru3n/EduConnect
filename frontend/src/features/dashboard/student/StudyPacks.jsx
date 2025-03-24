import { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Card, CardContent, CardMedia, Button, Grid, CircularProgress, Alert } from '@mui/material';
import PaymentModal from '../../../components/PaymentModal';

const StudyPacks = () => {
  const [studyPacks, setStudyPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedStudyPackId, setSelectedStudyPackId] = useState(null);

  useEffect(() => {
    const fetchStudyPacks = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/studypacks');
        setStudyPacks(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch study packs');
        setLoading(false);
      }
    };
    fetchStudyPacks();
  }, []);

  const handlePay = (studyPackId) => {
    setSelectedStudyPackId(studyPackId);
    setPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (paymentData) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post('http://localhost:5000/api/payments/subscribe-studypack', {
        studyPackId: paymentData.classId, // Using classId as studyPackId
        cardNumber: paymentData.cardNumber,
        expiryDate: paymentData.expiryDate,
        cvv: paymentData.cvv,
      }, config);
      alert('Purchase successful!');
      setPaymentModalOpen(false);
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Payment failed');
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>Available Study Packs</Typography>
      <Grid container spacing={3}>
        {studyPacks.map(pack => (
          <Grid item xs={12} sm={6} md={4} key={pack._id}>
            <Card>
              <CardMedia component="img" height="140" image={pack.coverPhotoUrl} alt={pack.title} />
              <CardContent>
                <Typography variant="h6">{pack.title}</Typography>
                <Typography variant="body2" color="textSecondary">Subject: {pack.subject}</Typography>
                <Typography variant="body2">Price: ${pack.price}</Typography>
                <Typography variant="body2">Videos: {pack.fileCount.videos}</Typography>
                <Typography variant="body2">PDFs: {pack.fileCount.pdfs}</Typography>
                <Typography variant="body2">URLs: {pack.fileCount.urls}</Typography>
                <Button variant="contained" color="primary" onClick={() => handlePay(pack._id)} sx={{ mt: 2 }}>Pay</Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <PaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        onSubmit={handlePaymentSubmit}
        classId={selectedStudyPackId}
      />
    </Box>
  );
};

export default StudyPacks;