import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ClassList = () => {
    const [classes, setClasses] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/classes/active');
                setClasses(data);
            } catch (error) {
                console.error('Error fetching classes:', error);
            }
        };
        fetchClasses();
    }, []);

    const handleSubscribe = (classId) => {
        navigate(`/student/dashboard/subscribe/${classId}`);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Available Classes</h2>
            {classes.length === 0 ? (
                <p className="text-gray-600 text-lg">No active classes available.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classes.map(cls => (
                        <div
                            key={cls._id}
                            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 p-6 flex flex-col justify-between"
                        >
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">{cls.subject}</h3>
                                <p className="text-gray-600 mb-2">Monthly Fee: <span className="font-medium text-green-600">${cls.monthlyFee}</span></p>
                                <p className="text-gray-500 text-sm italic">Teacher: {cls.teacherId.name}</p>
                            </div>
                            <button
                                onClick={() => handleSubscribe(cls._id)}
                                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                            >
                                Subscribe
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClassList;