//frontend/src/features/dashboard/student/ClassMaterials.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ClassMaterials = () => {
    const { classId } = useParams();
    const [materials, setMaterials] = useState([]);

    useEffect(() => {
        const fetchMaterials = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                const { data } = await axios.get(`http://localhost:5000/api/classes/${classId}/materials`, config);
                setMaterials(data);
            } catch (error) {
                console.error('Error fetching materials:', error);
            }
        };
        fetchMaterials();
    }, [classId]);

    return (
        <div>
            <h2>Class Materials</h2>
            {materials.length === 0 ? (
                <p>No materials available for this class.</p>
            ) : (
                materials.map(material => (
                    <div key={material._id} style={{ marginBottom: '1rem' }}>
                        <h3>{material.title}</h3>
                        {material.type === 'video' && (
                            <video controls src={material.content} style={{ maxWidth: '100%' }} />
                        )}
                        {material.type === 'link' && (
                            <a href={material.content} target="_blank" rel="noopener noreferrer">Open Link</a>
                        )}
                        {material.type === 'document' && (
                            <a href={material.content} download>Download Document</a>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default ClassMaterials;