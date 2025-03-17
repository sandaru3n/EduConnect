//frontend/src/features/dashboard/student/ClassList.jsx
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
        <div>
            <h2>Available Classes</h2>
            {classes.length === 0 ? (
                <p>No active classes available.</p>
            ) : (
                classes.map(cls => (
                    <div key={cls._id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
                        <h3>{cls.subject}</h3>
                        <p>Monthly Fee: ${cls.monthlyFee}</p>
                        <p>Teacher: {cls.teacherId.name}</p>
                        <button onClick={() => handleSubscribe(cls._id)}>Subscribe</button>
                    </div>
                ))
            )}
        </div>
    );
};

export default ClassList;