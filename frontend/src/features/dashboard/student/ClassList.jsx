import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const ClassList = () => {
    const [classes, setClasses] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchClasses = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get("http://localhost:5000/api/classes/active");
                setClasses(data);
            } catch (err) {
                setError(err.response?.data?.message || "Error loading classes");
            } finally {
                setLoading(false);
            }
        };
        fetchClasses();
    }, []);

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Classes</h2>
            {error && (
                <p className="text-red-600 bg-red-100 p-3 rounded-md text-center mb-6 shadow-sm">
                    {error}
                </p>
            )}
            {loading ? (
                <p className="text-gray-600 text-center">Loading classes...</p>
            ) : classes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {classes.map((classItem) => (
                        <div
                            key={classItem._id}
                            className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 transform transition-all duration-300 hover:shadow-xl"
                        >
                            {/* Cover Photo */}
                            <img
                                src={
                                    classItem.coverPhoto
                                        ? `http://localhost:5000${classItem.coverPhoto}`
                                        : "https://via.placeholder.com/300x140?text=No+Cover+Photo"
                                }
                                alt={`${classItem.subject} cover`}
                                className="w-full h-36 object-cover"
                            />
                            <div className="p-4 flex flex-col">
                                {/* Class Name (Subject) */}
                                <h3 className="text-lg font-bold text-gray-800 truncate">
                                    {classItem.subject}
                                </h3>
                                {/* Monthly Fee */}
                                <div className="flex justify-between items-center text-lg mt-1">
                                    <span className="text-gray-600"></span>
                                    <span className="text-blue-600 font-bold">USD {classItem.monthlyFee} </span>
                                </div>
                                {/* Teacher Name */}
                                <p className="text-sm font-bold text-gray-500">
                                    Teacher: {classItem.teacherId?.name || "N/A"}
                                </p>
                                {/* Subscribe Button */}
                                <Link
                                    to={`/student/dashboard/subscribe/${classItem._id}`}
                                    className="mt-3 bg-blue-600 text-white py-2 px-4 rounded-md text-center hover:bg-blue-700 transition-all duration-300 font-semibold shadow-md"
                                >
                                    Subscribe
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-600 text-center">No classes available at the moment.</p>
            )}
        </div>
    );
};

export default ClassList;