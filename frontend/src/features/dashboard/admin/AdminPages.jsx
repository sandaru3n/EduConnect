//frontend/src/features/dashboard/admin/AdminPages.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Container, Typography, List, ListItem, ListItemText, CircularProgress, Paper, Button } from "@mui/material";

const AdminPages = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/pages");
      const data = await response.json();
      setPages(data);
    } catch (error) {
      console.error("Error fetching pages:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
        Manage Pages
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <Paper elevation={3} sx={{ p: 3 }}>
          <List>
            {pages.map((page) => (
              <ListItem key={page._id}>
                <ListItemText primary={page.title} />
                <Button variant="contained" component={Link} to={`/admin/pages/edit-page/${page.slug}`}>
                  Edit
                </Button>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Container>
  );
};

export default AdminPages;
