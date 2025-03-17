//frontend/src/features/dashboard/teacher/CreateClass.jsx

import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateClass = () => {
    const [subject, setSubject] = useState("");
    const [monthlyFee, setMonthlyFee] = useState("");
    const [description, setDescription] = useState(""); // Additional field
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            const classData = {
                subject,
                monthlyFee: Number(monthlyFee),
                description,
                teacherId: userInfo._id,
            };

            await axios.post(
                "http://localhost:5000/api/teacher/classes",
                classData,
                config
            );
            
            navigate("/teacher/dashboard");
        } catch (error) {
            setError(error.response?.data?.message || "Error creating class");
        }
    };

    return (
        <div>
            <h2>Create New Class</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <input
                        type="text"
                        placeholder="Subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <input
                        type="number"
                        placeholder="Monthly Fee"
                        value={monthlyFee}
                        onChange={(e) => setMonthlyFee(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <textarea
                        placeholder="Class Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <button type="submit">Create Class</button>
            </form>
        </div>
    );
};

export default CreateClass;