const User = require("../models/User");
const Class = require("../models/Class");
const Subscription = require("../models/Subscription");
const StudentSubscription = require("../models/StudentSubscription");

exports.getAdminDashboardMetrics = async (req, res) => {
    try {
        // Total Students: Count users with role "student"
        const totalStudents = await User.countDocuments({ role: "student" });

        // Total Revenue: Sum of feePaid from StudentSubscription
        const revenueResult = await StudentSubscription.aggregate([
            { $match: { status: "Active" } },
            { $group: { _id: null, totalRevenue: { $sum: "$feePaid" } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

        // Active Courses (Active Classes): Count classes with isActive: true
        const activeCourses = await Class.countDocuments({ isActive: true });

        // Subscription Plans: Count active subscription plans
        const subscriptionPlans = await Subscription.countDocuments({ status: "Active" });

        // Format the data to match the frontend structure
        const metrics = [
            {
                id: 1,
                title: "Total Students",
                value: totalStudents,
                change: "+12%", // Placeholder; you can calculate this dynamically if you have historical data
                trend: "up",
                icon: "PeopleIcon", // Frontend will handle the icon
                color: "#4f46e5"
            },
            {
                id: 2,
                title: "Total Revenue",
                value: `$${totalRevenue.toLocaleString()}`,
                change: "+23%", // Placeholder
                trend: "up",
                icon: "PaymentIcon",
                color: "#0ea5e9"
            },
            {
                id: 3,
                title: "Active Classes",
                value: activeCourses,
                change: "+5", // Placeholder
                trend: "up",
                icon: "MenuBookIcon",
                color: "#10b981"
            },
            {
                id: 4,
                title: "Subscription Plans",
                value: subscriptionPlans,
                change: "0", // Placeholder
                trend: "neutral",
                icon: "AssignmentIcon",
                color: "#f59e0b"
            }
        ];

        res.status(200).json(metrics);
    } catch (error) {
        console.error("Get admin dashboard metrics error:", error);
        res.status(500).json({ message: "Error fetching dashboard metrics", error: error.message });
    }
};