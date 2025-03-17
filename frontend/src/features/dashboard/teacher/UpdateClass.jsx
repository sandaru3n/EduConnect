//frontend/src/features/dashboard/teacher/UpdateClass.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const UpdateClass = () => {
    const [subject, setSubject] = useState("");
    const [monthlyFee, setMonthlyFee] = useState("");
    const [description, setDescription] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { classId } = useParams();

    useEffect(() => {
        const fetchClass = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem("userInfo"));
                const config = {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                };

                const { data } = await axios.get(
                    `http://localhost:5000/api/teacher/classes/${classId}`,
                    config
                );
                
                setSubject(data.subject);
                setMonthlyFee(data.monthlyFee);
                setDescription(data.description);
                setIsActive(data.isActive);
            } catch (error) {
                setError(error.response?.data?.message || "Error fetching class");
            }
        };

        fetchClass();
    }, [classId]);

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
                isActive,
            };

            await axios.put(
                `http://localhost:5000/api/teacher/classes/${classId}`,
                classData,
                config
            );
            
            navigate("/teacher/dashboard");
        } catch (error) {
            setError(error.response?.data?.message || "Error updating class");
        }
    };

    return (
        <div>
            <h2>Update Class</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <input
                        type="number"
                        value={monthlyFee}
                        onChange={(e) => setMonthlyFee(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <div>
                    <label>
                        Active:
                        <input
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                        />
                    </label>
                </div>
                <button type="submit">Update Class</button>
            </form>
        </div>
    );
};

export default UpdateClass;