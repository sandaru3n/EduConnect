// frontend/src/features/dashboard/teacher/ViewAllClasses.jsx
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

    if (loading) return <div className="text-center text-indigo-600 font-semibold">Loading...</div>;
    if (error) return (
        <div className="text-red-600 bg-red-100 p-3 rounded-md text-center shadow-sm">
            {error}
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-gray-100 to-teal-50 p-6">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-extrabold text-center text-indigo-700 mb-8 tracking-tight">
                    My Classes
                </h2>
                {classes.length === 0 ? (
                    <p className="text-gray-600 text-center text-lg">No classes found</p>
                ) : (
                    <ul className="space-y-6">
                        {classes.map((classItem) => (
                            <li
                                key={classItem._id}
                                className="bg-white p-6 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300"
                            >
                                <h3 className="text-xl font-semibold text-indigo-900 mb-2">
                                    {classItem.subject}
                                </h3>
                                <p className="text-teal-700 font-medium">
                                    Fee: ${classItem.monthlyFee}
                                </p>
                                <p className="text-gray-600 italic mt-1">
                                    {classItem.description}
                                </p>
                                <p className={`mt-2 font-medium ${classItem.isActive ? "text-green-600" : "text-red-600"}`}>
                                    Status: {classItem.isActive ? "Active" : "Inactive"}
                                </p>
                                <button
                                    onClick={() => handleEdit(classItem._id)}
                                    className="mt-4 bg-gradient-to-r from-green-500 to-teal-500 text-white py-2 px-4 rounded-md hover:from-green-600 hover:to-teal-600 transition-all duration-300 font-semibold shadow-md transform hover:scale-105"
                                >
                                    Edit Details
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default ViewAllClasses;