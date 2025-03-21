// backend/controllers/paymentController.js
const StudentSubscription = require('../models/StudentSubscription');
const Class = require('../models/Class');
const User = require("../models/User");
const Subscription = require("../models/Subscription");

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

        let subscription = await StudentSubscription.findOne({ userId, classId });
        if (subscription) {
            // If subscription exists (inactive), reactivate it
            if (subscription.status === 'Inactive') {
                subscription.status = 'Active';
                subscription.feePaid = classData.monthlyFee;
                subscription.createdAt = new Date(); // Update payment date
                await subscription.save();
                return res.status(200).json({ message: 'Subscription reactivated successfully', subscriptionId: subscription._id });
            } else {
                return res.status(400).json({ message: 'Already subscribed to this class' });
            }
        }

        // Create new subscription if none exists
        subscription = new StudentSubscription({
            userId,
            classId,
            feePaid: classData.monthlyFee,
        });
        await subscription.save();
        res.status(201).json({ message: 'Subscription successful', subscriptionId: subscription._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error processing subscription', error: error.message });
    }
};

exports.processSubscriptionPayment = async (req, res) => {
    const { userId, subscriptionId, cardNumber, expiryDate, cvv } = req.body;

    if (!validateCard(cardNumber, expiryDate, cvv)) {
        return res.status(400).json({ message: "Invalid card details" });
    }

    const paymentSuccess = processPayment(cardNumber); // Simulated payment gateway
    if (!paymentSuccess) {
        return res.status(500).json({ message: "Payment processing failed" });
    }

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const subscription = await Subscription.findById(subscriptionId);
        if (!subscription) return res.status(404).json({ message: "Subscription not found" });

        user.subscriptionId = subscriptionId;
        user.subscriptionStatus = "active";
        await user.save();

        res.status(200).json({ message: "Subscription activated successfully", user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error processing subscription", error: error.message });
    }
};

// Simple card validation function (unchanged)
function validateCard(cardNumber, expiryDate, cvv) {
    const cardRegex = /^\d{16}$/;
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    const cvvRegex = /^\d{3,4}$/;
    return cardRegex.test(cardNumber) && expiryRegex.test(expiryDate) && cvvRegex.test(cvv);
}

// Simulate payment success (unchanged)
function processPayment(cardNumber) {
    return cardNumber.length === 16; // Dummy success condition
}
