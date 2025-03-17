//backend/controllers/paymentController.js
const StudentSubscription = require('../models/StudentSubscription');
const Class = require('../models/Class');

exports.subscribeToClass = async (req, res) => {
    const { classId, cardNumber, expiryDate, cvv } = req.body;
    const userId = req.user.id; // From authMiddleware

    // Custom card validation
    if (!validateCard(cardNumber, expiryDate, cvv)) {
        return res.status(400).json({ message: 'Invalid card details' });
    }

    // Simulate payment processing
    const paymentSuccess = processPayment(cardNumber); // Simulated for now
    if (!paymentSuccess) {
        return res.status(500).json({ message: 'Payment processing failed' });
    }

    try {
        const classData = await Class.findById(classId);
        if (!classData) {
            return res.status(404).json({ message: 'Class not found' });
        }

        const subscription = new StudentSubscription({
            userId,
            classId,
            feePaid: classData.monthlyFee, // Store the fee at the time of subscription
        });
        await subscription.save();
        res.status(201).json({ message: 'Subscription successful', subscriptionId: subscription._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating subscription' });
    }
};

// Simple card validation function
function validateCard(cardNumber, expiryDate, cvv) {
    const cardRegex = /^\d{16}$/;
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    const cvvRegex = /^\d{3,4}$/;
    return cardRegex.test(cardNumber) && expiryRegex.test(expiryDate) && cvvRegex.test(cvv);
}

// Simulate payment success (replace with real gateway logic later)
function processPayment(cardNumber) {
    return cardNumber.length === 16; // Dummy success condition
}









