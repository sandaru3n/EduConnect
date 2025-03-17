//frontend/src/routes/ProtectedRoute.jsx
import PropTypes from "prop-types";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth"; // Corrected import from custom hook

const ProtectedRoute = ({ children, role }) => {
    const location = useLocation();
    const { user } = useAuth(); // Ensure useAuth() provides { user }

    // If user is not logged in, redirect to login & store last location
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If user is logged in but has an incorrect role, redirect to home
    if (role && user.role !== role) {
        return (
            <Navigate
                to="/"
                state={{
                    error: "You don't have permission to access this page",
                }}
                replace
            />
        );
    }

    return children;
};

// ✅ Define PropTypes to avoid ESLint warnings
ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    role: PropTypes.oneOf(["admin", "teacher", "student", "institute"]),
};

// ✅ Default props for role
ProtectedRoute.defaultProps = {
    role: undefined,
};

export default ProtectedRoute;
