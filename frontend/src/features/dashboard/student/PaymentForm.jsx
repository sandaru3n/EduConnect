// frontend/src/features/dashboard/student/PaymentForm.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import './PaymentForm.css';

const PaymentForm = () => {
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const navigate = useNavigate();
    const { classId } = useParams();

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
        <div className="payment-container">
            <form onSubmit={handleSubmit} className="payment-form">
                <h2 className="payment-title">Subscribe to Class</h2>
                <div className="form-group">
                    <label htmlFor="cardNumber">Card Number</label>
                    <input
                        type="text"
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        required
                        className="payment-input"
                    />
                </div>
                <div className="form-row">
                    <div className="form-group half-width">
                        <label htmlFor="expiryDate">Expiry Date</label>
                        <input
                            type="text"
                            id="expiryDate"
                            placeholder="MM/YY"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                            required
                            className="payment-input"
                        />
                    </div>
                    <div className="form-group half-width">
                        <label htmlFor="cvv">CVV</label>
                        <input
                            type="text"
                            id="cvv"
                            placeholder="123"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value)}
                            required
                            className="payment-input"
                        />
                    </div>
                </div>
                <button type="submit" className="payment-button">Pay Now</button>
            </form>
        </div>
    );
};

export default PaymentForm;