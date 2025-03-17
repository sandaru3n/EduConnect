// backend/routes/adminRoutes.js

const express = require("express");
const router = express.Router();

// Sample route for admin
router.get("/", (req, res) => {
    res.send("Admin Route Working!");
});

module.exports = router;