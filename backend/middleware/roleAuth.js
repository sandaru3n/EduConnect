// backend/middleware/roleAuth.js

const authorizeRole = (roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Forbidden: You don't have the right permissions" });
      }
      next();
    };
  };
  
  module.exports = authorizeRole;  // Export the function correctly
  