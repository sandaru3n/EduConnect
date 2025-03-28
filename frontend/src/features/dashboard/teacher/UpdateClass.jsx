// frontend/src/features/dashboard/teacher/UpdateClass.jsx
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
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-gray-100 to-teal-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
                <h2 className="text-3xl font-extrabold text-center text-indigo-700 mb-6 tracking-tight">
                    Update Class
                </h2>
                {error && (
                    <p className="text-red-600 bg-red-100 p-3 rounded-md text-center mb-6 shadow-sm">
                        {error}
                    </p>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Subject"
                            required
                            className="w-full px-4 py-2 border border-indigo-300 rounded-md bg-indigo-50 text-indigo-900 placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                        />
                    </div>
                    <div>
                        <input
                            type="number"
                            value={monthlyFee}
                            onChange={(e) => setMonthlyFee(e.target.value)}
                            placeholder="Monthly Fee"
                            required
                            className="w-full px-4 py-2 border border-teal-300 rounded-md bg-teal-50 text-teal-900 placeholder-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300"
                        />
                    </div>
                    <div>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Class Description"
                            className="w-full px-4 py-2 border border-purple-300 rounded-md bg-purple-50 text-purple-900 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent h-32 resize-none transition-all duration-300"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <label className="text-gray-700 font-medium">
                            Active:
                        </label>
                        <input
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-md hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-md transform hover:scale-105"
                    >
                        Update Class
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UpdateClass;