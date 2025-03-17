//backend/controllers/subscriptionController.js
const Subscription = require("../models/Subscription.js");

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
