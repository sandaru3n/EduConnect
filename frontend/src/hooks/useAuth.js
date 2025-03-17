//frontend/src/hooks/useAuth.jsx

import { useState, useEffect } from "react";

const useAuth = () => {
    const [user, setUser] = useState(() => {
        // Initialize state from localStorage if available
        const userInfo = localStorage.getItem("userInfo");
        return userInfo ? JSON.parse(userInfo) : null;
    });

    useEffect(() => {
        const handleStorageChange = () => {
            // Update user when localStorage changes
            const userInfo = localStorage.getItem("userInfo");
            setUser(userInfo ? JSON.parse(userInfo) : null);
        };

        window.addEventListener("storage", handleStorageChange); // Listen to localStorage changes

        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    const logout = () => {
        localStorage.removeItem("userInfo");
        setUser(null); // Set user to null after logout
    };

    return { user, logout }; // Always return user and logout function
};

export default useAuth;
