// backend/routes/subscriptionRoutes.js

const express = require("express");
const router = express.Router();
const {
  getSubscriptions,
  addSubscription,
  editSubscription,getTopSubscriptionsByRevenue,getUserGrowth,
  deleteSubscription,getTeacherSubscriptionRevenue,getInstituteSubscriptionRevenue,getUserDistribution,getSubscriptionTrends
} = require("../controllers/subscriptionController");

// Verify base path matches frontend requests
router.route("/")
  .get(getSubscriptions)
  .post(addSubscription);




router.route("/:id")
  .put(editSubscription)
  .delete(deleteSubscription);


const { getMyClasses, getPaymentHistory } = require('../controllers/stusubscriptionController');
const authMiddleware = require('../middleware/auth');

// Define the GET route for /api/subscriptions/my-classes
router.get('/my-classes', authMiddleware, getMyClasses);
router.get('/payment-history', authMiddleware, getPaymentHistory); // New route



// New analytics routes
router.get("/analytics/teacher-revenue",  getTeacherSubscriptionRevenue);
router.get("/analytics/institute-revenue",  getInstituteSubscriptionRevenue);
router.get("/analytics/user-distribution",  getUserDistribution);
router.get("/analytics/subscription-trends",  getSubscriptionTrends);
router.get("/analytics/top-subscriptions", getTopSubscriptionsByRevenue);
router.get("/analytics/user-growth", getUserGrowth);

module.exports = router;