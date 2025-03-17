// backend/middleware/auth.js
const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        
        if (!token) {
            return res.status(401).json({ message: "No authentication token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.id };
        
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: "Invalid authentication token" });
    }
};

module.exports = authMiddleware;