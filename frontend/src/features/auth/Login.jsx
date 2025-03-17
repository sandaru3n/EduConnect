//frontend/src/features/auth/Login.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post("http://localhost:5000/api/auth/login", { email, password });
    
            // Store user info in local storage
            localStorage.setItem("userInfo", JSON.stringify(data));
            

            console.log("User Role:", data.role); // ✅ Debugging
            console.log("Navigating to:", `/ ${data.role}/dashboard`); // ✅ Debugging
    
            // Role-based redirection
            if (data.role === "admin") {
                navigate("/admin/dashboard");
            } else if (data.role === "teacher") {
                navigate("/teacher/dashboard");
            } else if (data.role === "student") {
                navigate("/student/dashboard");
            } else if (data.role === "institute") {
                navigate("/institute/dashboard");
            } else {
                navigate("/"); // Redirect to home if role is unknown
            }
        } catch (error) {
            console.error("Login error:", error);
            alert("Login Failed!");
        }
    };
    

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;
