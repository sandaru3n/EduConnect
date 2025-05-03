const User = require("../models/User");

// Fetch subscription history for logged-in teacher/institute using createdAt
exports.getTeacherSubscriptionHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId)
            .populate("subscriptionId", "plan price");
        if (!user || !["teacher", "institute"].includes(user.role)) {
            return res.status(403).json({ message: "Only teachers and institutes can access subscription history" });
        }

        if (!user.subscriptionId || user.subscriptionStatus !== "active") {
            return res.status(200).json([]); // No active subscription, return empty history
        }

        const subscriptionHistory = [{
            _id: user._id,
            subscriptionId: user.subscriptionId, // Populated subscription object
            startDate: user.createdAt,
            endDate: null, // Ongoing subscription
            status: user.subscriptionStatus,
            createdAt: user.createdAt
        }];

        res.status(200).json(subscriptionHistory);
    } catch (error) {
        console.error("Get teacher subscription history error:", error);
        res.status(500).json({ message: "Error fetching subscription history", error: error.message });
    }
};

// Fetch payment history for logged-in teacher/institute by calculating monthly intervals
exports.getTeacherPaymentHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId)
            .populate("subscriptionId", "plan price");
        if (!user || !["teacher", "institute"].includes(user.role)) {
            return res.status(403).json({ message: "Only teachers and institutes can access payment history" });
        }

        if (!user.subscriptionId || user.subscriptionStatus !== "active") {
            return res.status(200).json([]); // No active subscription, return empty payment history
        }

        // Log a warning if subscription data is missing
        if (!user.subscriptionId?.plan || !user.subscriptionId?.price) {
            console.warn(`Subscription data missing for user ${userId}. SubscriptionId: ${user.subscriptionId?._id}`);
        }

        const subscriptionStartDate = new Date(user.createdAt); // When the user subscribed
        const currentDate = new Date(); // Use the actual current date
        const subscriptionPrice = user.subscriptionId?.price || 0; // Price from the subscription plan

        // Calculate the number of months between subscription start date and current date
        const diffInMonths = Math.floor(
            (currentDate - subscriptionStartDate) / (1000 * 60 * 60 * 24 * 30)
        );

        // Generate payment history for each month
        const paymentHistory = [];
        for (let i = 0; i <= diffInMonths; i++) {
            const paymentDate = new Date(subscriptionStartDate);
            paymentDate.setMonth(paymentDate.getMonth() + i);

            // Calculate due date (30 days after payment date)
            const dueDate = new Date(paymentDate);
            dueDate.setDate(dueDate.getDate() + 30);

            // Generate a random 7-digit invoice number (e.g., INV-1234567)
            const randomNumber = Math.floor(1000000 + Math.random() * 9000000); // Random 7-digit number
            const invoiceNumber = `INV-${randomNumber}`;

            // Only include payments up to the current date
            if (paymentDate <= currentDate) {
                paymentHistory.push({
                    _id: `${userId}_${i}`, // Generate a unique ID for each payment entry
                    subscriptionId: user.subscriptionId, // Populated subscription object
                    amount: subscriptionPrice,
                    paymentDate: paymentDate,
                    dueDate: dueDate,
                    paymentMethod: "Credit Card", // Assumed
                    status: "Completed", // Assumed
                    createdAt: paymentDate,
                    invoiceNumber: invoiceNumber,
                    description: `Monthly subscription payment for ${user.subscriptionId?.plan || "Unknown Plan"}`,
                    subtotal: subscriptionPrice
                });
            }
        }

        // Sort by paymentDate in descending order
        paymentHistory.sort((a, b) => b.paymentDate - a.paymentDate);

        res.status(200).json(paymentHistory);
    } catch (error) {
        console.error("Get teacher payment history error:", error);
        res.status(500).json({ message: "Error fetching payment history", error: error.message });
    }
};