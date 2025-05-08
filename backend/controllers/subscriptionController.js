//backend/controllers/subscriptionController.js
const Subscription = require("../models/Subscription.js");



const User = require("../models/User");


// Get all subscriptions
const getSubscriptions = async (req, res) => {
    try {
        const subscriptions = await Subscription.find();
        res.status(200).json(subscriptions);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch subscriptions", error: error.message });
    }
};

// Create new subscription
const addSubscription = async (req, res) => {
    try {
        // Add null check for req.body
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "Request body is missing" });
        }

        const { 
            plan, 
            studentLimit, 
            teacherAccounts, 
            storage, 
            support, 
            price,
            status = "Active" // Default value
        } = req.body;

        // Validate required fields
        const requiredFields = ['plan', 'studentLimit', 'teacherAccounts', 'storage', 'support', 'price'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Check for existing plan
        const existingPlan = await Subscription.findOne({ plan: plan.trim() });
        if (existingPlan) {
            return res.status(400).json({ message: "Plan name already exists" });
        }

        // Create new subscription
        const newSubscription = new Subscription({
            plan: plan.trim(),
            studentLimit: Number(studentLimit),
            teacherAccounts: Number(teacherAccounts),
            storage: storage.trim(),
            support: support.trim(),
            price: parseFloat(price),
            status: status || "Active"  // Ensure status is included
        });

        const savedSubscription = await newSubscription.save();
        res.status(201).json({
            message: "Subscription created successfully",
            subscription: savedSubscription
        });

    } catch (error) {
        console.error("Error creating subscription:", error);
        res.status(500).json({
            message: "Error creating subscription",
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Modify editSubscription controller
const editSubscription = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Convert numeric fields
        const numericFields = ['studentLimit', 'teacherAccounts', 'price'];
        numericFields.forEach(field => {
            if (updates[field]) updates[field] = Number(updates[field]);
        });

        // Trim string fields
        const stringFields = ['plan', 'storage', 'support'];
        stringFields.forEach(field => {
            if (updates[field]) updates[field] = updates[field].trim();
        });

        // Check plan uniqueness
        if (updates.plan) {
            const existing = await Subscription.findOne({ 
                plan: updates.plan,
                _id: { $ne: id } 
            });
            if (existing) {
                return res.status(400).json({ message: "Plan name already exists" });
            }
        }

        const updatedSubscription = await Subscription.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        if (!updatedSubscription) {
            return res.status(404).json({ message: "Subscription not found" });
        }

        res.status(200).json({
            message: "Subscription updated successfully",
            subscription: updatedSubscription
        });
        
    } catch (error) {
        res.status(400).json({
            message: "Error updating subscription",
            error: error.message
        });
    }
};

// Delete subscription
const deleteSubscription = async (req, res) => {
    try {
        const deletedSubscription = await Subscription.findByIdAndDelete(req.params.id);
        
        if (!deletedSubscription) {
            return res.status(404).json({ message: "Subscription not found" });
        }

        res.status(200).json({ message: "Subscription deleted successfully" });
    } catch (error) {
        res.status(500).json({ 
            message: "Error deleting subscription", 
            error: error.message 
        });
    }
};

module.exports = {
    getSubscriptions,
    addSubscription,
    editSubscription,
    deleteSubscription
};

// Get teacher subscription revenue by date
const getTeacherSubscriptionRevenue = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Validate date range
        if (!startDate || !endDate) {
            return res.status(400).json({ message: "Start date and end date are required" });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ message: "Invalid date format" });
        }

        // Fetch teachers with their subscription plans
        const teachers = await User.find({
            role: "teacher",
            subscriptionStatus: "active",
            createdAt: { $gte: start, $lte: end }
        }).populate("subscriptionId", "price");

        // Aggregate revenue by date
        const revenueByDate = {};
        teachers.forEach(teacher => {
            if (!teacher.subscriptionId || !teacher.subscriptionId.price) {
                return;
            }

            const createdAt = new Date(teacher.createdAt);
            const dateKey = createdAt.toISOString().split('T')[0]; // YYYY-MM-DD format

            if (!revenueByDate[dateKey]) {
                revenueByDate[dateKey] = 0;
            }
            revenueByDate[dateKey] += teacher.subscriptionId.price;
        });

        // Convert to array format for chart
        const revenueData = Object.keys(revenueByDate).map(date => ({
            date,
            revenue: revenueByDate[date]
        })).sort((a, b) => new Date(a.date) - new Date(b.date));

        res.status(200).json(revenueData);
    } catch (error) {
        console.error("Get teacher subscription revenue error:", error);
        res.status(500).json({ message: "Error fetching teacher subscription revenue", error: error.message });
    }
};

// Get institute subscription revenue by date
const getInstituteSubscriptionRevenue = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: "Start date and end date are required" });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ message: "Invalid date format" });
        }

        const institutes = await User.find({
            role: "institute",
            subscriptionStatus: "active",
            createdAt: { $gte: start, $lte: end }
        }).populate("subscriptionId", "price");

        const revenueByDate = {};
        institutes.forEach(institute => {
            if (!institute.subscriptionId || !institute.subscriptionId.price) {
                return;
            }

            const createdAt = new Date(institute.createdAt);
            const dateKey = createdAt.toISOString().split('T')[0]; // YYYY-MM-DD format

            if (!revenueByDate[dateKey]) {
                revenueByDate[dateKey] = 0;
            }
            revenueByDate[dateKey] += institute.subscriptionId.price;
        });

        const revenueData = Object.keys(revenueByDate).map(date => ({
            date,
            revenue: revenueByDate[date]
        })).sort((a, b) => new Date(a.date) - new Date(b.date));

        res.status(200).json(revenueData);
    } catch (error) {
        console.error("Get institute subscription revenue error:", error);
        res.status(500).json({ message: "Error fetching institute subscription revenue", error: error.message });
    }
};

// Get total teachers and institutes for pie chart
const getUserDistribution = async (req, res) => {
    try {
        const totalTeachers = await User.countDocuments({ role: "teacher" });
        const totalInstitutes = await User.countDocuments({ role: "institute" });

        const distributionData = [
            { name: "Teachers", value: totalTeachers },
            { name: "Institutes", value: totalInstitutes }
        ];

        res.status(200).json(distributionData);
    } catch (error) {
        console.error("Get user distribution error:", error);
        res.status(500).json({ message: "Error fetching user distribution", error: error.message });
    }
};

// Get subscription trends over time
const getSubscriptionTrends = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: "Start date and end date are required" });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ message: "Invalid date format" });
        }

        const users = await User.find({
            role: { $in: ["teacher", "institute"] },
            subscriptionStatus: "active",
            createdAt: { $gte: start, $lte: end }
        });

        const trendsByDate = {};
        users.forEach(user => {
            const createdAt = new Date(user.createdAt);
            const dateKey = createdAt.toISOString().split('T')[0]; // YYYY-MM-DD format

            if (!trendsByDate[dateKey]) {
                trendsByDate[dateKey] = { teachers: 0, institutes: 0 };
            }
            if (user.role === "teacher") {
                trendsByDate[dateKey].teachers += 1;
            } else if (user.role === "institute") {
                trendsByDate[dateKey].institutes += 1;
            }
        });

        const trendsData = Object.keys(trendsByDate).map(date => ({
            date,
            teachers: trendsByDate[date].teachers,
            institutes: trendsByDate[date].institutes
        })).sort((a, b) => new Date(a.date) - new Date(b.date));

        res.status(200).json(trendsData);
    } catch (error) {
        console.error("Get subscription trends error:", error);
        res.status(500).json({ message: "Error fetching subscription trends", error: error.message });
    }
};

// Get top revenue-generating subscriptions
const getTopSubscriptionsByRevenue = async (req, res) => {
    try {
        const users = await User.find({
            role: { $in: ["teacher", "institute"] },
            subscriptionStatus: "active"
        }).populate("subscriptionId", "plan price");

        const revenueByPlan = {};
        users.forEach(user => {
            if (!user.subscriptionId || !user.subscriptionId.plan || !user.subscriptionId.price) {
                return;
            }
            const planName = user.subscriptionId.plan;
            if (!revenueByPlan[planName]) {
                revenueByPlan[planName] = 0;
            }
            revenueByPlan[planName] += user.subscriptionId.price;
        });

        const topSubscriptions = Object.keys(revenueByPlan)
            .map(plan => ({
                plan,
                revenue: revenueByPlan[plan]
            }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5); // Top 5 plans

        res.status(200).json(topSubscriptions);
    } catch (error) {
        console.error("Get top subscriptions by revenue error:", error);
        res.status(500).json({ message: "Error fetching top subscriptions", error: error.message });
    }
};

// Get user growth over time
const getUserGrowth = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: "Start date and end date are required" });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return res.status(400).json({ message: "Invalid date format" });
        }

        const users = await User.find({
            role: { $in: ["teacher", "institute"] },
            createdAt: { $gte: start, $lte: end }
        });

        const growthByDate = {};
        users.forEach(user => {
            const createdAt = new Date(user.createdAt);
            const dateKey = createdAt.toISOString().split('T')[0]; // YYYY-MM-DD format

            if (!growthByDate[dateKey]) {
                growthByDate[dateKey] = { teachers: 0, institutes: 0 };
            }
            if (user.role === "teacher") {
                growthByDate[dateKey].teachers += 1;
            } else if (user.role === "institute") {
                growthByDate[dateKey].institutes += 1;
            }
        });

        const growthData = Object.keys(growthByDate)
            .map(date => {
                const prevDate = Object.keys(growthByDate)
                    .filter(d => new Date(d) < new Date(date))
                    .sort((a, b) => new Date(b) - new Date(a))[0];
                
                const cumulativeTeachers = prevDate
                    ? growthByDate[prevDate].teachers + growthByDate[date].teachers
                    : growthByDate[date].teachers;
                const cumulativeInstitutes = prevDate
                    ? growthByDate[prevDate].institutes + growthByDate[date].institutes
                    : growthByDate[date].institutes;

                return {
                    date,
                    teachers: cumulativeTeachers,
                    institutes: cumulativeInstitutes
                };
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date));

        res.status(200).json(growthData);
    } catch (error) {
        console.error("Get user growth error:", error);
        res.status(500).json({ message: "Error fetching user growth", error: error.message });
    }
};

module.exports = {
    getSubscriptions,
    addSubscription,
    editSubscription,
    deleteSubscription,
    getTeacherSubscriptionRevenue,
    getInstituteSubscriptionRevenue,
    getUserDistribution,
    getSubscriptionTrends,
    getTopSubscriptionsByRevenue,
    getUserGrowth
};
