//frontend/src/features/dashboard/teacher/ViewAllClasses.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ViewAllClasses = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem("userInfo"));
                const config = {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                };

                const { data } = await axios.get(
                    "http://localhost:5000/api/teacher/classes",
                    config
                );
                
                setClasses(data);
                setLoading(false);
            } catch (error) {
                setError(error.response?.data?.message || "Error fetching classes");
                setLoading(false);
            }
        };

        fetchClasses();
    }, []);

    const handleEdit = (classId) => {
        navigate(`/teacher/classes/${classId}/update`);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div style={{ color: "red" }}>{error}</div>;

    return (
        <div>
            <h2>My Classes</h2>
            {classes.length === 0 ? (
                <p>No classes found</p>
            ) : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {classes.map((classItem) => (
                        <li 
                            key={classItem._id}
                            style={{
                                border: "1px solid #ccc",
                                padding: "1rem",
                                marginBottom: "1rem",
                                borderRadius: "5px"
                            }}
                        >
                            <h3>{classItem.subject}</h3>
                            <p>Fee: ${classItem.monthlyFee}</p>
                            <p>{classItem.description}</p>
                            <p>Status: {classItem.isActive ? "Active" : "Inactive"}</p>
                            <button
                                onClick={() => handleEdit(classItem._id)}
                                style={{
                                    padding: "0.5rem 1rem",
                                    backgroundColor: "#4CAF50",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "3px",
                                    cursor: "pointer"
                                }}
                            >
                                Edit Details
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ViewAllClasses;