// frontend/src/features/dashboard/teacher/CreateClass.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateClass = () => {
    const [subject, setSubject] = useState("");
    const [monthlyFee, setMonthlyFee] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});
    const navigate = useNavigate();

    // Validation function
    const validateForm = () => {
        const errors = {};

        // Subject validation
        if (!subject.trim()) {
            errors.subject = "Subject is required";
        } else if (subject.length < 2) {
            errors.subject = "Subject must be at least 2 characters long";
        } else if (subject.length > 50) {
            errors.subject = "Subject must be less than 50 characters";
        }

        // Monthly fee validation
        if (!monthlyFee) {
            errors.monthlyFee = "Monthly fee is required";
        } else if (isNaN(monthlyFee) || Number(monthlyFee) <= 0) {
            errors.monthlyFee = "Monthly fee must be a positive number";
        } else if (Number(monthlyFee) > 10000) {
            errors.monthlyFee = "Monthly fee cannot exceed $10,000";
        }

        // Description validation (optional field)
        if (description && description.length > 500) {
            errors.description = "Description must be less than 500 characters";
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Run validation before submission
        if (!validateForm()) {
            return;
        }

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
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-gray-100 to-teal-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
                <h2 className="text-3xl font-extrabold text-center text-indigo-700 mb-6 tracking-tight">
                    Create New Class
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
                            placeholder="Subject"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                            className={`w-full px-4 py-2 border rounded-md bg-indigo-50 text-indigo-900 placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 ${
                                validationErrors.subject ? 'border-red-300' : 'border-indigo-300'
                            }`}
                        />
                        {validationErrors.subject && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors.subject}</p>
                        )}
                    </div>
                    <div>
                        <input
                            type="number"
                            placeholder="Monthly Fee"
                            value={monthlyFee}
                            onChange={(e) => setMonthlyFee(e.target.value)}
                            required
                            className={`w-full px-4 py-2 border rounded-md bg-teal-50 text-teal-900 placeholder-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-300 ${
                                validationErrors.monthlyFee ? 'border-red-300' : 'border-teal-300'
                            }`}
                        />
                        {validationErrors.monthlyFee && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors.monthlyFee}</p>
                        )}
                    </div>
                    <div>
                        <textarea
                            placeholder="Class Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className={`w-full px-4 py-2 border rounded-md bg-purple-50 text-purple-900 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent h-32 resize-none transition-all duration-300 ${
                                validationErrors.description ? 'border-red-300' : 'border-purple-300'
                            }`}
                        />
                        {validationErrors.description && (
                            <p className="text-red-500 text-sm mt-1">{validationErrors.description}</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 rounded-md hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-md transform hover:scale-105"
                    >
                        Create Class
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateClass;