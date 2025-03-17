// backend/routes/subscriptionRoutes.js

const express = require("express");
const router = express.Router();
const {
  getSubscriptions,
  addSubscription,
  editSubscription,
  deleteSubscription
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

module.exports = router;