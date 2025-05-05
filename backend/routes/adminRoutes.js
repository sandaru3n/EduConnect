// backend/routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const { getAllTeachers, banTeacher,unbanTeacher,deleteTeacher,updateTeacher } = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');

// Get all teachers (admin role check moved to controller)
router.get('/teachers', authMiddleware, getAllTeachers);

// Ban a teacher by setting subscriptionStatus to inactive (admin role check moved to controller)
router.put('/teachers/:teacherId/ban', authMiddleware, banTeacher);

router.put('/teachers/:teacherId/unban', authMiddleware, unbanTeacher);

// Delete a teacher (admin role check in controller)
router.delete('/teachers/:teacherId', authMiddleware, deleteTeacher);

// Update a teacher's details (admin role check in controller)
router.put('/teachers/:teacherId', authMiddleware, updateTeacher);


// Sample route for admin
router.get("/", (req, res) => {
    res.send("Admin Route Working!");
});



module.exports = router;