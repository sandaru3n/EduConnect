// backend/routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const { getAllTeachers, banTeacher,unbanTeacher,deleteTeacher,updateTeacher,getAllInstitutes,banInstitute,unbanInstitute,deleteInstitute,updateInstitute } = require('../controllers/adminController');
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


// Get all teachers (admin role check moved to controller)
router.get('/institutes', authMiddleware, getAllInstitutes);

router.put('/institutes/:instituteId/ban', authMiddleware, banInstitute);
router.put('/institutes/:instituteId/unban', authMiddleware, unbanInstitute);
router.delete('/institutes/:instituteId', authMiddleware,deleteInstitute);
router.put('/institutes/:instituteId', authMiddleware, updateInstitute);


// Sample route for admin
router.get("/", (req, res) => {
    res.send("Admin Route Working!");
});



module.exports = router;