//frontend/src/features/home/PageView.jsx
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Container, Typography, CircularProgress, Box } from "@mui/material";

const PageView = () => {
  const location = useLocation();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPage();
  }, [location.pathname]);

  const fetchPage = async () => {
    try {
      const slug = location.pathname.substring(1); // Remove the leading '/'
      const response = await fetch(`http://localhost:5000/api/pages/${slug}`);
      if (!response.ok) throw new Error("Page not found");
      const data = await response.json();
      setPage(data);
    } catch (error) {
      console.error("Error fetching page:", error);
      setPage(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {loading ? (
        <CircularProgress />
      ) : page ? (
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            {page.title}
          </Typography>
          <Typography variant="body1" dangerouslySetInnerHTML={{ __html: page.content }} />
        </Box>
      ) : (
        <Typography variant="h5">Page Not Found</Typography>
      )}
    </Container>
  );
};

export default PageView;
