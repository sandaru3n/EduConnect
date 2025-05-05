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
  Paper,
  Checkbox,
  FormControlLabel,
  Modal,
  Fade
} from '@mui/material';
import { CreditCard, CalendarToday, Lock, ArrowBack, CheckCircle } from '@mui/icons-material';
import Confetti from 'react-confetti';

// Define the base URL for the backend (can be moved to a config file)
const BASE_URL = 'http://localhost:5000';

const PaymentForm = () => {
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardholderName, setCardholderName] = useState('');
    const [addressLine1, setAddressLine1] = useState('');
    const [addressLine2, setAddressLine2] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [classDetails, setClassDetails] = useState(null);
    const [errors, setErrors] = useState({
        cardNumber: false,
        expiryDate: false,
        cvv: false,
    });
    const [showSuccessModal, setShowSuccessModal] = useState(false); // State for success modal
    const navigate = useNavigate();
    const { classId } = useParams();

    useEffect(() => {
        const fetchClassDetails = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get(`${BASE_URL}/api/payments/class-details/${classId}`, config);
                setClassDetails(data);
            } catch (error) {
                console.error('Error fetching class details:', error);
                alert('Failed to load class details. Please try again.');
            }
        };

        fetchClassDetails();
    }, [classId]);

    const handleCardNumberChange = (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        if (value.length <= 16) { // Limit to 16 digits
            setCardNumber(value);
            setErrors((prev) => ({ ...prev, cardNumber: value.length !== 16 }));
        }
    };

    const handleCvcChange = (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        if (value.length <= 4) { // Limit to 4 digits
            setCvv(value);
            setErrors((prev) => ({ ...prev, cvv: value.length < 3 || value.length > 4 }));
        }
    };

    const handleExpiryDateChange = (e) => {
        let value = e.target.value.replace(/[^0-9/]/g, ''); // Allow only digits and "/"
        let digits = value.replace(/\D/g, ''); // Extract digits only for processing

        if (digits.length <= 4) { // Limit to 4 digits (MMYY)
            if (digits.length <= 2) {
                value = digits;
            } else {
                value = `${digits.slice(0, 2)}/${digits.slice(2)}`;
            }
            setExpiryDate(value);
            setErrors((prev) => ({
                ...prev,
                expiryDate: !/^(0[1-9]|1[0-2])\/\d{2}$/.test(value) && value.length === 5
            }));
        }
    };

    const validateCardDetails = () => {
        const cardRegex = /^\d{16}$/;
        const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
        const cvvRegex = /^\d{3,4}$/;

        const newErrors = {
            cardNumber: !cardRegex.test(cardNumber),
            expiryDate: !expiryRegex.test(expiryDate),
            cvv: !cvvRegex.test(cvv),
        };

        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate card details
        if (!validateCardDetails()) {
            return;
        }

        // Validate terms acceptance
        if (!termsAccepted) {
            alert('Please accept the terms to proceed.');
            return;
        }

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            };
            const response = await axios.post(`${BASE_URL}/api/payments/subscribe`, {
                classId,
                cardNumber,
                expiryDate,
                cvv
            }, config);
            setShowSuccessModal(true); // Show the success modal
        } catch (error) {
            console.error('Payment error:', error);
            alert('Payment failed: ' + (error.response?.data?.message || 'Please try again'));
        }
    };

    const handleCloseSuccessModal = () => {
        setShowSuccessModal(false);
        navigate('/student/dashboard/my-classes'); // Redirect after closing the modal
    };

    const handleBack = () => {
        navigate(-1); // Navigate back to the previous page
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                backgroundColor: '#fff',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                p: { xs: 2, md: -4 },
                position: 'relative', // For absolute positioning of the back button
            }}
        >
            <Paper
                sx={{
                    maxWidth: 900,
                    width: '100%',
                    borderRadius: 0,
                    boxShadow: 'none',
                    backgroundColor: '#fff',
                }}
            >
                <Box sx={{ position: 'absolute', top: 6, left: 250 }}>
                    <Button
                        onClick={handleBack}
                        startIcon={<ArrowBack sx={{ color: '#6b7280' }} />}
                        sx={{
                            textTransform: 'none',
                            color: '#6b7280',
                            fontSize: '0.875rem',
                            fontWeight: 'bold',
                            '&:hover': {
                                backgroundColor: 'transparent',
                                color: '#3b82f6',
                            },
                        }}
                    >
                        Back
                    </Button>
                </Box>
                <Grid container spacing={0} sx={{ pt: 1 }}>
                    {/* Left Section: Class Details */}
                    <Grid item xs={12} md={5}>
                        <Box
                            sx={{
                                p: { xs: 2, md: 4 },
                                backgroundColor: '#fff',
                                borderRight: { xs: 'none', md: '1px solid #e5e7eb' },
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                            }}
                        >
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#000', mb: 2 }}>
                                Subscribe to {classDetails?.className}
                            </Typography>
                            {classDetails ? (
                                <>
                                    {/* Class Cover Photo */}
                                    {classDetails.coverPhoto ? (
                                        <Box
                                            sx={{
                                                width: '100%',
                                                height: 150,
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
                                                height: 150,
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

                                    <Typography variant="body1" sx={{ color: '#6b7280' }}>
                                        {classDetails.className}
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: '#6b7280' }}>
                                        Taught by {classDetails.teacherName}
                                    </Typography>
                                    <Divider sx={{ my: 1 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body1" sx={{ color: '#6b7280' }}>
                                            Monthly Fee
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: '#000' }}>
                                            ${classDetails.monthlyFee}
                                        </Typography>
                                    </Box>
                                    {classDetails.discountPercentage > 0 && (
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body1" sx={{ color: '#6b7280' }}>
                                                Discount ({classDetails.discountPercentage}%)
                                            </Typography>
                                            <Typography variant="body1" sx={{ color: '#22c55e' }}>
                                                -${(classDetails.monthlyFee - classDetails.finalFee).toFixed(2)}
                                            </Typography>
                                        </Box>
                                    )}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body1" sx={{ color: '#6b7280' }}>
                                            Subtotal
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: '#000' }}>
                                            ${classDetails.discountPercentage > 0 ? classDetails.finalFee : classDetails.monthlyFee}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body1" sx={{ color: '#6b7280' }}>
                                            Tax
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: '#000' }}>
                                            $0.00
                                        </Typography>
                                    </Box>
                                    <Divider sx={{ my: 1 }} />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#000' }}>
                                            Total due today
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#000' }}>
                                            ${classDetails.discountPercentage > 0 ? classDetails.finalFee : classDetails.monthlyFee}
                                        </Typography>
                                    </Box>
                                </>
                            ) : (
                                <Typography variant="body1" color="text.secondary">
                                    Loading class details...
                                </Typography>
                            )}
                        </Box>
                    </Grid>

                    {/* Right Section: Payment Form */}
                    <Grid item xs={12} md={7}>
                        <Box
                            sx={{
                                p: { xs: 2, md: 4 },
                                backgroundColor: '#fff',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                            }}
                        >
                            <form onSubmit={handleSubmit}>
                                <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#000', mb: 1 }}>
                                    Payment method
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                                    Card information
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Card number"
                                    value={cardNumber}
                                    onChange={handleCardNumberChange}
                                    required
                                    variant="outlined"
                                    error={errors.cardNumber}
                                    helperText={errors.cardNumber ? 'Your card number must be 16 digits.' : ''}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <CreditCard sx={{ color: '#6b7280' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        mb: 2,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 1,
                                            backgroundColor: '#fff',
                                            borderColor: errors.cardNumber ? '#ef4444' : '#d1d5db',
                                            '&:hover fieldset': {
                                                borderColor: errors.cardNumber ? '#ef4444' : '#9ca3af',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: errors.cardNumber ? '#ef4444' : '#3b82f6',
                                            },
                                        },
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderWidth: '1px',
                                        },
                                        '& .MuiInputBase-input': {
                                            py: 1.5,
                                            fontSize: '0.875rem',
                                            color: '#000',
                                        },
                                    }}
                                />
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            placeholder="MM/YY"
                                            value={expiryDate}
                                            onChange={handleExpiryDateChange}
                                            required
                                            variant="outlined"
                                            error={errors.expiryDate}
                                            helperText={errors.expiryDate ? 'Invalid expiry date.' : ''}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <CalendarToday sx={{ color: '#6b7280' }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{
                                                mb: 2,
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 1,
                                                    backgroundColor: '#fff',
                                                    borderColor: errors.expiryDate ? '#ef4444' : '#d1d5db',
                                                    '&:hover fieldset': {
                                                        borderColor: errors.expiryDate ? '#ef4444' : '#9ca3af',
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: errors.expiryDate ? '#ef4444' : '#3b82f6',
                                                    },
                                                },
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderWidth: '1px',
                                                },
                                                '& .MuiInputBase-input': {
                                                    py: 1.5,
                                                    fontSize: '0.875rem',
                                                    color: '#000',
                                                },
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            placeholder="CVC"
                                            value={cvv}
                                            onChange={handleCvcChange}
                                            required
                                            variant="outlined"
                                            error={errors.cvv}
                                            helperText={errors.cvv ? 'CVC must be 3-4 digits.' : ''}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <Lock sx={{ color: '#6b7280' }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            sx={{
                                                mb: 2,
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 1,
                                                    backgroundColor: '#fff',
                                                    borderColor: errors.cvv ? '#ef4444' : '#d1d5db',
                                                    '&:hover fieldset': {
                                                        borderColor: errors.cvv ? '#ef4444' : '#9ca3af',
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: errors.cvv ? '#ef4444' : '#3b82f6',
                                                    },
                                                },
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderWidth: '1px',
                                                },
                                                '& .MuiInputBase-input': {
                                                    py: 1.5,
                                                    fontSize: '0.875rem',
                                                    color: '#000',
                                                },
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                                <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                                    Cardholder name
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Full name on card"
                                    value={cardholderName}
                                    onChange={(e) => setCardholderName(e.target.value)}
                                    required
                                    variant="outlined"
                                    sx={{
                                        mb: 2,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 1,
                                            backgroundColor: '#fff',
                                            borderColor: '#d1d5db',
                                            '&:hover fieldset': {
                                                borderColor: '#9ca3af',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#3b82f6',
                                            },
                                        },
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderWidth: '1px',
                                        },
                                        '& .MuiInputBase-input': {
                                            py: 1.5,
                                            fontSize: '0.875rem',
                                            color: '#000',
                                        },
                                    }}
                                />
                                <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                                    Billing address
                                </Typography>
                                <TextField
                                    fullWidth
                                    placeholder="Address line 1"
                                    value={addressLine1}
                                    onChange={(e) => setAddressLine1(e.target.value)}
                                    required
                                    variant="outlined"
                                    sx={{
                                        mb: 2,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 1,
                                            backgroundColor: '#fff',
                                            borderColor: '#d1d5db',
                                            '&:hover fieldset': {
                                                borderColor: '#9ca3af',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#3b82f6',
                                            },
                                        },
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderWidth: '1px',
                                        },
                                        '& .MuiInputBase-input': {
                                            py: 1.5,
                                            fontSize: '0.875rem',
                                            color: '#000',
                                        },
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    placeholder="Address line 2"
                                    value={addressLine2}
                                    onChange={(e) => setAddressLine2(e.target.value)}
                                    variant="outlined"
                                    sx={{
                                        mb: 2,
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 1,
                                            backgroundColor: '#fff',
                                            borderColor: '#d1d5db',
                                            '&:hover fieldset': {
                                                borderColor: '#9ca3af',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: '#3b82f6',
                                            },
                                        },
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderWidth: '1px',
                                        },
                                        '& .MuiInputBase-input': {
                                            py: 1.5,
                                            fontSize: '0.875rem',
                                            color: '#000',
                                        },
                                    }}
                                />
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            placeholder="City"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            required
                                            variant="outlined"
                                            sx={{
                                                mb: 2,
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 1,
                                                    backgroundColor: '#fff',
                                                    borderColor: '#d1d5db',
                                                    '&:hover fieldset': {
                                                        borderColor: '#9ca3af',
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: '#3b82f6',
                                                    },
                                                },
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderWidth: '1px',
                                                },
                                                '& .MuiInputBase-input': {
                                                    py: 1.5,
                                                    fontSize: '0.875rem',
                                                    color: '#000',
                                                },
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <TextField
                                            fullWidth
                                            placeholder="Postal code"
                                            value={postalCode}
                                            onChange={(e) => setPostalCode(e.target.value)}
                                            required
                                            variant="outlined"
                                            sx={{
                                                mb: 2,
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 1,
                                                    backgroundColor: '#fff',
                                                    borderColor: '#d1d5db',
                                                    '&:hover fieldset': {
                                                        borderColor: '#9ca3af',
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: '#3b82f6',
                                                    },
                                                },
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderWidth: '1px',
                                                },
                                                '& .MuiInputBase-input': {
                                                    py: 1.5,
                                                    fontSize: '0.875rem',
                                                    color: '#000',
                                                },
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={termsAccepted}
                                            onChange={(e) => setTermsAccepted(e.target.checked)}
                                            sx={{
                                                color: '#d1d5db',
                                                '&.Mui-checked': {
                                                    color: '#3b82f6',
                                                },
                                            }}
                                        />
                                    }
                                    label={
                                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                            You'll be charged the amount and at the frequency listed above until you cancel, which you can do at any time. By subscribing, you agree to EduConnect's <a href="/terms" target="_blank" style={{ color: '#3b82f6' }}>Terms of Use</a> and <a href="/privacy" target="_blank" style={{ color: '#3b82f6' }}>Privacy Policy</a>.
                                        </Typography>
                                    }
                                    sx={{ mb: 2 }}
                                />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    sx={{
                                        backgroundColor: '#10a375',
                                        borderRadius: 2,
                                        py: 1.5,
                                        textTransform: 'uppercase',
                                        fontWeight: 'bold',
                                        color: '#fff',
                                        boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)',
                                        transition: 'all 0.3s ease-in-out',
                                        '&:hover': {
                                            backgroundColor: '#168864',
                                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                                            transform: 'translateY(-1px)',
                                        },
                                    }}
                                >
                                    Subscribe
                                </Button>
                            </form>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {/* Success Modal */}
            <Modal
                open={showSuccessModal}
                onClose={handleCloseSuccessModal}
                closeAfterTransition
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <Fade in={showSuccessModal}>
                    <Box
                        sx={{
                            bgcolor: '#ffffff',
                            borderRadius: 2,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                            p: 4,
                            textAlign: 'center',
                            position: 'relative',
                            width: '90%',
                            maxWidth: 400,
                        }}
                    >
                        <Confetti width={400} height={400} numberOfPieces={200} recycle={false} />
                        <CheckCircle sx={{ fontSize: 60, color: '#10a375', mb: 2 }} />
                        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#111827', mb: 1 }}>
                            Subscription Successful!
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#6b7280', mb: 3 }}>
                            You have successfully subscribed to the class "{classDetails?.className}". Enjoy your learning journey!
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={handleCloseSuccessModal}
                            sx={{
                                backgroundColor: '#4f46e5',
                                color: '#ffffff',
                                fontWeight: 500,
                                py: 1,
                                borderRadius: 2,
                                textTransform: 'none',
                                '&:hover': {
                                    backgroundColor: '#4338ca',
                                },
                            }}
                        >
                            Continue
                        </Button>
                    </Box>
                </Fade>
            </Modal>
        </Box>
    );
};

export default PaymentForm;