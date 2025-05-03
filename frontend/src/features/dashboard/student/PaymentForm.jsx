import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Box, 
  Grid, 
  Typography, 
  TextField, 
  Button, 
  Divider, 
  InputAdornment, 
  Paper 
} from '@mui/material';
import { CreditCard, CalendarToday, Lock } from '@mui/icons-material';

const PaymentForm = () => {
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [classDetails, setClassDetails] = useState(null);
    const navigate = useNavigate();
    const { classId } = useParams();

    // Define the base URL for the backend (can be moved to a config file)
    const BASE_URL = 'http://localhost:5000';

    useEffect(() => {
        const fetchClassDetails = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get(`http://localhost:5000/api/payments/class-details/${classId}`, config);
                setClassDetails(data);
            } catch (error) {
                console.error('Error fetching class details:', error);
                alert('Failed to load class details. Please try again.');
            }
        };

        fetchClassDetails();
    }, [classId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };
            const response = await axios.post('http://localhost:5000/api/payments/subscribe', {
                classId,
                cardNumber,
                expiryDate,
                cvv
            }, config);
            alert(response.data.message); // "Subscription successful" or "Subscription reactivated successfully"
            navigate('/student/dashboard/my-classes');
        } catch (error) {
            console.error('Payment error:', error);
            alert('Payment failed: ' + (error.response?.data?.message || 'Please try again'));
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                p: { xs: 2, md: 4 },
            }}
        >
            <Paper
                sx={{
                    maxWidth: 1200,
                    width: '100%',
                    borderRadius: 3,
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden',
                    backgroundColor: '#fff',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
                    },
                }}
            >
                <Grid container spacing={0}>
                    {/* Left Section: Class Details */}
                    <Grid item xs={12} md={6}>
                        <Box
                            sx={{
                                p: 4,
                                background: 'linear-gradient(135deg, #e8f0fe 0%, #d1e0ff 100%)',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                            }}
                        >
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e3a8a', mb: 2 }}>
                                Class Details
                            </Typography>
                            {classDetails ? (
                                <>
                                    {/* Class Cover Photo */}
                                    {classDetails.coverPhoto ? (
                                        <Box
                                            sx={{
                                                width: '100%',
                                                height: 200,
                                                borderRadius: 2,
                                                overflow: 'hidden',
                                                mb: 2,
                                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                            }}
                                        >
                                            <img
                                                src={`${BASE_URL}${classDetails.coverPhoto}`}
                                                alt="Class Cover"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                onError={(e) => (e.target.style.display = 'none')}
                                            />
                                        </Box>
                                    ) : (
                                        <Box
                                            sx={{
                                                width: '100%',
                                                height: 200,
                                                borderRadius: 2,
                                                backgroundColor: '#e5e7eb',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mb: 2,
                                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                            }}
                                        >
                                            <Typography variant="body1" color="text.secondary">
                                                No Cover Photo
                                            </Typography>
                                        </Box>
                                    )}

                                    {/* Class Name */}
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#374151' }}>
                                        Class: {classDetails.className}
                                    </Typography>

                                    {/* Teacher Name */}
                                    <Typography variant="body1" sx={{ color: '#374151' }}>
                                        <strong>Teacher:</strong> {classDetails.teacherName}
                                    </Typography>

                                    {/* Monthly Fee */}
                                    <Typography variant="body1" sx={{ color: '#374151' }}>
                                        <strong>Monthly Fee:</strong> ${classDetails.monthlyFee}
                                    </Typography>

                                    {/* Discount (if applicable) */}
                                    {classDetails.discountPercentage > 0 ? (
                                        <>
                                            <Typography variant="body1" sx={{ color: '#22c55e' }}>
                                                <strong>Discount:</strong> {classDetails.discountPercentage}% off
                                            </Typography>
                                            <Typography variant="body1" sx={{ color: '#374151' }}>
                                                <strong>Final Fee:</strong> ${classDetails.finalFee}
                                            </Typography>
                                        </>
                                    ) : (
                                        <Typography variant="body1" sx={{ color: '#374151' }}>
                                            <strong>Final Fee:</strong> ${classDetails.monthlyFee}
                                        </Typography>
                                    )}

                                    {/* Description */}
                                    <Typography variant="body1" sx={{ color: '#374151' }}>
                                        <strong>Description:</strong> {classDetails.description || 'No description available.'}
                                    </Typography>
                                </>
                            ) : (
                                <Typography variant="body1" color="text.secondary">
                                    Loading class details...
                                </Typography>
                            )}
                        </Box>
                    </Grid>

                    {/* Right Section: Payment Form */}
                    <Grid item xs={12} md={6}>
                        <Box
                            sx={{
                                p: 4,
                                backgroundColor: '#fff',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                            }}
                        >
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1e3a8a', mb: 2 }}>
                                Payment Details
                            </Typography>
                            <form onSubmit={handleSubmit}>
                                <TextField
                                    fullWidth
                                    label="Card Number"
                                    placeholder="1234 5678 9012 3456"
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(e.target.value)}
                                    required
                                    variant="outlined"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <CreditCard sx={{ color: '#1e3a8a' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        mb: 2,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            backgroundColor: '#fff',
                                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                                            '&:hover fieldset': {
                                                borderColor: '#1e3a8a',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#1e3a8a',
                                                boxShadow: '0 0 0 3px rgba(30, 58, 138, 0.1)',
                                            },
                                        },
                                        '& .MuiInputLabel-root': {
                                            color: '#6b7280',
                                            '&.Mui-focused': {
                                                color: '#1e3a8a',
                                            },
                                        },
                                    }}
                                />
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="Expiry Date"
                                            placeholder="MM/YY"
                                            value={expiryDate}
                                            onChange={(e) => setExpiryDate(e.target.value)}
                                            required
                                            variant="outlined"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <CalendarToday sx={{ color: '#1e3a8a' }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{
                                                mb: 2,
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    backgroundColor: '#fff',
                                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                                                    '&:hover fieldset': {
                                                        borderColor: '#1e3a8a',
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: '#1e3a8a',
                                                        boxShadow: '0 0 0 3px rgba(30, 58, 138, 0.1)',
                                                    },
                                                },
                                                '& .MuiInputLabel-root': {
                                                    color: '#6b7280',
                                                    '&.Mui-focused': {
                                                        color: '#1e3a8a',
                                                    },
                                                },
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            label="CVV"
                                            placeholder="123"
                                            value={cvv}
                                            onChange={(e) => setCvv(e.target.value)}
                                            required
                                            variant="outlined"
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Lock sx={{ color: '#1e3a8a' }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{
                                                mb: 2,
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2,
                                                    backgroundColor: '#fff',
                                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                                                    '&:hover fieldset': {
                                                        borderColor: '#1e3a8a',
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: '#1e3a8a',
                                                        boxShadow: '0 0 0 3px rgba(30, 58, 138, 0.1)',
                                                    },
                                                },
                                                '& .MuiInputLabel-root': {
                                                    color: '#6b7280',
                                                    '&.Mui-focused': {
                                                        color: '#1e3a8a',
                                                    },
                                                },
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    sx={{
                                        backgroundColor: '#1e3a8a',
                                        borderRadius: 2,
                                        py: 1.5,
                                        textTransform: 'none',
                                        fontWeight: 'bold',
                                        color: '#fff',
                                        boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)',
                                        transition: 'all 0.3s ease-in-out',
                                        '&:hover': {
                                            backgroundColor: '#1e40af',
                                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                                            transform: 'translateY(-1px)',
                                        },
                                    }}
                                >
                                    Pay Now
                                </Button>
                            </form>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default PaymentForm;