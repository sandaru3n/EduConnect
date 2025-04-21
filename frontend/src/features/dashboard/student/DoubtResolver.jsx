import { useState } from "react";
import axios from "axios";
import {
    Box,
    Typography,
    TextField,
    Button,
    Input,
    Alert,
    Paper,
    Card,
    CardContent,
    CircularProgress
} from "@mui/material";
import { CheckCircleOutline } from "@mui/icons-material";
import useAuth from "../../../hooks/useAuth";

const DoubtResolver = () => {
    const { user } = useAuth();
    const [text, setText] = useState("");
    const [file, setFile] = useState(null);
    const [response, setResponse] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        setResponse("");
        setLoading(true);

        const formData = new FormData();
        if (text) {
            formData.append("text", text);
        }
        if (file) {
            formData.append("file", file);
        }

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    "Content-Type": "multipart/form-data"
                }
            };
            const { data } = await axios.post(
                "http://localhost:5000/api/doubt/resolve",
                formData,
                config
            );

            setResponse(data.response || "No guidance provided.");
            setSuccess(true);
            setText("");
            setFile(null);
            document.getElementById("file-upload").value = null; // Reset file input
        } catch (err) {
            setError(err.response?.data?.message || "Error resolving doubt");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 800, mx: "auto", p: 3 }}>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h4" gutterBottom>AI Doubt Resolver</Typography>
                <Typography variant="body1" sx={{ mb: 3, color: "text.secondary" }}>
                    Enter your doubt or upload a photo/PDF to get clear, step-by-step guidance to solve it.
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Describe your doubt"
                        multiline
                        rows={4}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        margin="normal"
                        placeholder="E.g., How do I solve this quadratic equation?"
                        variant="outlined"
                    />
                    <Box sx={{ mt: 2, mb: 3 }}>
                        <Input
                            type="file"
                            accept="image/jpeg,image/png,application/pdf"
                            onChange={handleFileChange}
                            id="file-upload"
                            sx={{ display: 'none' }}
                        />
                        <label htmlFor="file-upload">
                            <Button variant="outlined" component="span" sx={{ textTransform: 'none' }}>
                                Upload Photo or PDF
                            </Button>
                        </label>
                        {file && (
                            <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
                                Selected: {file.name}
                            </Typography>
                        )}
                    </Box>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={loading || (!text && !file)}
                        sx={{ py: 1.5, textTransform: 'none' }}
                    >
                        {loading ? <CircularProgress size={24} /> : "Resolve Doubt"}
                    </Button>
                </form>
                {(response || success) && (
                    <Card sx={{ mt: 4, borderRadius: 2, boxShadow: 3 }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <CheckCircleOutline sx={{ color: 'success.main', mr: 1 }} />
                                <Typography variant="h6" color="success.main">
                                    Doubt Resolved
                                </Typography>
                            </Box>
                            {response ? (
                                <Typography
                                    variant="body1"
                                    sx={{
                                        whiteSpace: 'pre-line', // Preserve line breaks
                                        lineHeight: 1.8,
                                        '& strong': { color: 'primary.main' } // Highlight step numbers
                                    }}
                                    component="div"
                                >
                                    {response.split('\n').map((line, index) => (
                                        <Box key={index} sx={{ mb: 1 }}>
                                            {line.startsWith("Step") ? (
                                                <>
                                                    <strong>{line.split(":")[0]}:</strong>
                                                    {line.split(":").slice(1).join(":")}
                                                </>
                                            ) : (
                                                line
                                            )}
                                        </Box>
                                    ))}
                                </Typography>
                            ) : (
                                <Typography variant="body1" color="text.secondary">
                                    No guidance provided. Please try a clearer problem statement.
                                </Typography>
                            )}
                        </CardContent>
                    </Card>
                )}
            </Paper>
        </Box>
    );
};

export default DoubtResolver;