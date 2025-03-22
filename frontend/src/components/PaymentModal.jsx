// frontend/src/components/PaymentModal.jsx
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
                width: 400,
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
                borderRadius: 2
            }}>
                <Typography variant="h6" gutterBottom>
                    Enter Payment Details
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <TextField
                    fullWidth
                    label="Card Number"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    label="Expiry Date (MM/YY)"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    margin="normal"
                    required
                />
                <TextField
                    fullWidth
                    label="CVV"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    margin="normal"
                    required
                />
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handlePayment}
                    sx={{ mt: 2 }}
                >
                    Pay Now
                </Button>
            </Box>
        </Modal>
    );
};

export default PaymentModal;