// backend/routes/studentRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { getActiveTeachers } = require('../controllers/studentController');


// Sample route for students
router.get("/", (req, res) => {
    res.send("Student Route Working!");
});


router.get("/teachers", authMiddleware, getActiveTeachers);

module.exports = router;
