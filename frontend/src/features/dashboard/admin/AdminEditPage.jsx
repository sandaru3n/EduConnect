//frontend/src/features/dashboard/admin/AdminEditPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Typography, CircularProgress, TextField, Button, Paper } from "@mui/material";

const AdminEditPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPage();
  }, [slug]);

  const fetchPage = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/pages/${slug}`);
      const data = await response.json();
      setPage(data);
    } catch (error) {
      console.error("Error fetching page:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await fetch(`http://localhost:5000/api/pages/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(page),
      });
      alert("Page updated successfully!");
      navigate("/admin/pages");
    } catch (error) {
      console.error("Error updating page:", error);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {loading ? (
        <CircularProgress />
      ) : (
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            Edit {page.title}
          </Typography>
          <TextField
            fullWidth
            label="Title"
            value={page.title}
            onChange={(e) => setPage({ ...page, title: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Content"
            multiline
            rows={8}
            value={page.content}
            onChange={(e) => setPage({ ...page, content: e.target.value })}
            margin="normal"
          />
          <Button variant="contained" onClick={handleUpdate} sx={{ mt: 2 }}>
            Save Changes
          </Button>
        </Paper>
      )}
    </Container>
  );
};

export default AdminEditPage;
