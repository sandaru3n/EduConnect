// frontend/src/features/dashboard/teacher/UploadMaterial.jsx
import { useState, useEffect } from "react";
import axios from "axios";

const UploadMaterial = ({ classId }) => {
    const [title, setTitle] = useState("");
    const [type, setType] = useState("video");
    const [content, setContent] = useState("");
    const [file, setFile] = useState(null);
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState(classId || "");

    useEffect(() => {
        const fetchClasses = async () => {
            const config = {
                headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("userInfo")).token}` }
            };
            const { data } = await axios.get("http://localhost:5000/api/teacher/classes", config);
            setClasses(data);
        };
        fetchClasses();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const config = {
            headers: {
                Authorization: `Bearer ${userInfo.token}`,
                "Content-Type": "multipart/form-data"
            }
        };

        const formData = new FormData();
        formData.append("title", title);
        formData.append("type", type);
        if (type === "document") {
            formData.append("file", file);
        } else {
            formData.append("content", content);
        }

        await axios.post(
            `http://localhost:5000/api/teacher/classes/${selectedClass}/materials`,
            formData,
            config
        );
        // Reset form or redirect
    };

    return (
        <form onSubmit={handleSubmit}>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                <option value="">Select Class</option>
                {classes.map(cls => (
                    <option key={cls._id} value={cls._id}>{cls.subject}</option>
                ))}
            </select>
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Material Title"
            />
            <select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="video">Video</option>
                <option value="link">Link</option>
                <option value="document">Document</option>
            </select>
            {type !== "document" ? (
                <input
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="URL"
                />
            ) : (
                <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                />
            )}
            <button type="submit">Upload Material</button>
        </form>
    );
};

export default UploadMaterial;