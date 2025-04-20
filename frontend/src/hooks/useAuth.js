//frontend/src/hooks/useAuth.jsx

import { useState, useEffect } from "react";
import axios from "axios";

const useAuth = () => {
    const [user, setUser] = useState(() => {
        // Initialize state from localStorage if available
        const userInfo = localStorage.getItem("userInfo");
        return userInfo ? JSON.parse(userInfo) : null;
    });

    useEffect(() => {

        const fetchUserProfile = async () => {
            if (user && user.token) {
                try {
                    const config = {
                        headers: { Authorization: `Bearer ${user.token}` }
                    };
                    const { data } = await axios.get("http://localhost:5000/api/auth/profile", config);
                    const updatedUser = { ...user, ...data, token: user.token };
                    localStorage.setItem("userInfo", JSON.stringify(updatedUser));
                    setUser(updatedUser);
                } catch (err) {
                    console.error("Error fetching user profile:", err);
                }
            }
        };

        fetchUserProfile();



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
