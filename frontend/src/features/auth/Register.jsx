//frontend/src/features/auth/Register.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("student"); // Default role as student
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post("http://localhost:5000/api/auth/register", {
                name,
                email,
                password,
                role
            });

            // Store the user info in localStorage after successful registration
            localStorage.setItem("userInfo", JSON.stringify(data));

            // Redirect to login page after registration
            alert("Registration successful! Please log in.");
            navigate("/login"); // Navigate to login page

        } catch (error) {
            console.error("Registration error:", error);

            if (error.response && error.response.data.message) {
                alert(`Registration Failed: ${error.response.data.message}`);
            } else {
                alert("Registration Failed! Please try again.");
            }
        }
    };

    return (
        <div>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="institute">Institute</option>
                    <option value="admin">Admin</option>
                </select>
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default Register;
