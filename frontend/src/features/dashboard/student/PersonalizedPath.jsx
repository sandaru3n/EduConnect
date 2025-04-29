import { useState, useEffect } from "react";
import axios from "axios";
import {
    Box,
    Typography,
    Paper,
    Alert,
    List,
    ListItem,
    ListItemText
} from "@mui/material";
import useAuth from "../../../hooks/useAuth";

const StudentDashboard = () => {
    const { user } = useAuth();
    const [learningPath, setLearningPath] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchLearningPath = async () => {
            setLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get("http://localhost:5000/api/quiz/student/learning-path", config);
                setLearningPath(data.learningPath);
            } catch (err) {
                setError(err.response?.data?.message || "Error loading personalized learning path");
            } finally {
                setLoading(false);
            }
        };
        fetchLearningPath();
    }, [user.token]);

    return (
        <Box sx={{ maxWidth: 800, mx: "auto", p: 3, mt: "50px" }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                
                <Typography variant="h4" gutterBottom>Personalized Learning Path</Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {loading ? (
                    <Typography variant="body1" color="text.secondary">Loading learning path...</Typography>
                ) : learningPath ? (
                    <Box>
                        <Typography variant="body1" sx={{ mb: 2, fontWeight: "bold" }}>Summary:</Typography>
                        <Typography variant="body1" sx={{ mb: 2 }}>{learningPath.summary}</Typography>
                        {learningPath.focusAreas.length > 0 ? (
                            <>
                                <Typography variant="body1" sx={{ mb: 1, fontWeight: "bold" }}>Focus Areas:</Typography>
                                <List>
                                    {learningPath.focusAreas.map((area, index) => (
                                        <ListItem key={index} sx={{ flexDirection: "column", alignItems: "flex-start" }}>
                                            <ListItemText
                                                primary={`Topic: ${area.topic} (${area.subject}) - ${area.percentage}%`}
                                                secondary={
                                                    <>
                                                        <Typography variant="body2" component="span" sx={{ fontWeight: "bold" }}>
                                                            Recommendations:
                                                        </Typography>
                                                        <ul>
                                                            {area.recommendations.map((rec, idx) => (
                                                                <li key={idx}>{rec}</li>
                                                            ))}
                                                        </ul>
                                                    </>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </>
                        ) : (
                            <Typography variant="body2" color="text.secondary">No focus areas identified. Keep up the good work!</Typography>
                        )}
                        <Typography variant="body1" sx={{ mt: 2, fontWeight: "bold" }}>Motivation:</Typography>
                        <Typography variant="body1">{learningPath.motivation}</Typography>
                    </Box>
                ) : (
                    <Typography variant="body1" color="text.secondary">No learning path available. Please attempt some quizzes to generate a personalized learning path.</Typography>
                )}
            </Paper>
        </Box>
    );
};

export default StudentDashboard;