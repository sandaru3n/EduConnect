//frontend/src/components/PaymentModel.jsx
import React, { useState } from "react";
import { Box, Modal, TextField, Button, Typography, Alert } from "@mui/material";

const PaymentModal = ({ open, onClose, onSubmit, classId }) => {
    const [cardNumber, setCardNumber] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [cvv, setCvv] = useState("");
    const [error, setError] = useState(null);

    const handlePayment = async () => {
        setError(null);
        try {
            await onSubmit({ classId, cardNumber, expiryDate, cvv });
            setCardNumber("");
            setExpiryDate("");
            setCvv("");
            onClose();
        } catch (err) {
            setError(err.message || "Payment failed");
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: '90%', sm: 400 },
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: { xs: 3, sm: 4 },
                borderRadius: 2,
            }} className="bg-white rounded-xl shadow-2xl">
                <Typography variant="h6" gutterBottom className="text-2xl font-semibold text-gray-800 mb-4">
                    Enter Payment Details
                </Typography>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} className="rounded-lg bg-red-50 text-red-600 border border-red-200">
                        {error}
                    </Alert>
                )}
                <TextField
                    fullWidth
                    label="Card Number"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    margin="normal"
                    required
                    className="mb-4"
                    InputProps={{
                        className: "rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all duration-200"
                    }}
                    InputLabelProps={{
                        className: "text-gray-600"
                    }}
                />
                <TextField
                    fullWidth
                    label="Expiry Date (MM/YY)"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    margin="normal"
                    required
                    className="mb-4"
                    InputProps={{
                        className: "rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all duration-200"
                    }}
                    InputLabelProps={{
                        className: "text-gray-600"
                    }}
                />
                <TextField
                    fullWidth
                    label="CVV"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    margin="normal"
                    required
                    className="mb-4"
                    InputProps={{
                        className: "rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all duration-200"
                    }}
                    InputLabelProps={{
                        className: "text-gray-600"
                    }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handlePayment}
                    sx={{ mt: 2 }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors duration-200"
                >
                    Pay Now
                </Button>
                <Button
                    variant="outlined"
                    fullWidth
                    onClick={onClose}
                    sx={{ mt: 2 }}
                    className="border-gray-300 text-gray-700 hover:bg-gray-100 font-medium py-3 rounded-lg transition-colors duration-200"
                >
                    Cancel
                </Button>
            </Box>
        </Modal>
    );
};

export default PaymentModal;