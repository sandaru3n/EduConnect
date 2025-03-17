// backend/routes/studentRoutes.js
const express = require("express");
const router = express.Router();

// Sample route for students
router.get("/", (req, res) => {
    res.send("Student Route Working!");
});

module.exports = router;
