//frontend/src/features/dashboard/student/eLibrary.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import './eLibrary.css';
import { Breadcrumbs, Link as MuiLink, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import StudentSidebar from "../../../components/StudentSidebar/index";
import StudentHeader from "../../../components/StudentHeader/index";

const EBookDashboard = () => {
  const [eBooks, setEBooks] = useState([]);
  const [filters, setFilters] = useState({ author: '', category: '', uploadDate: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Get pathnames for breadcrumbs
  const pathnames = location.pathname.split("/").filter((x) => x);
  const breadcrumbItems = pathnames.map((value, index) => {
    const last = index === pathnames.length - 1;
    const to = `/${pathnames.slice(0, index + 1).join("/")}`;
    const displayName = value.charAt(0).toUpperCase() + value.slice(1);

    return last ? (
      <Typography key={to} color="text.primary">
        {displayName}
      </Typography>
    ) : (
      <MuiLink
        key={to}
        component={Link}
        to={to}
        underline="hover"
        color="inherit"
      >
        {displayName}
      </MuiLink>
    );
  });

  // Page title effect
  useEffect(() => {
    const pageTitle = pathnames.length > 0 
      ? pathnames[pathnames.length - 1].charAt(0).toUpperCase() + pathnames[pathnames.length - 1].slice(1)
      : "Dashboard";
    document.title = `${pageTitle} - Student Dashboard - EduConnect`;
  }, [location, pathnames]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  useEffect(() => {
    const handleResize = () => {
      const mobileView = window.innerWidth <= 768;
      setIsMobile(mobileView);
      setIsSidebarCollapsed(mobileView);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchEBooks();
  }, [filters]);

  const fetchEBooks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/ebooks', {
        params: filters
      });
      setEBooks(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching eBooks:', err);
      setError('Failed to load eBooks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleDownload = async (id) => {
    try {
      window.open(`http://localhost:5000/api/ebooks/download/${id}`, '_blank');
      setTimeout(fetchEBooks, 1000);
    } catch (error) {
      console.error('Download error:', error);
      alert('Error downloading eBook');
    }
  };

  return (
    <div>
      <StudentHeader 
        isSidebarCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        isMobile={isMobile}
      />
      
      <div className="flex min-h-screen">
        <div
          className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 ${
            isSidebarCollapsed ? "w-[60px]" : "w-[18%] md:w-[250px]"
          }`}
        >
          <StudentSidebar 
            isCollapsed={isSidebarCollapsed} 
            toggleSidebar={toggleSidebar} 
          />
        </div>

        <div
          className={`flex-1 transition-all duration-300 ${
            isSidebarCollapsed ? "ml-[60px]" : "ml-[18%] md:ml-[250px]"
          }`}
        >
          <div
            className={`mt-[50px] py-2 px-4 md:px-6 bg-gray-100 border-b fixed top-0 w-full z-30 transition-all duration-300 ${
              isSidebarCollapsed 
                ? "ml-[60px] w-[calc(100%-60px)]" 
                : "ml-[18%] w-[calc(100%-18%)] md:ml-[250px] md:w-[calc(100%-250px)]"
            }`}
          >
            <Breadcrumbs aria-label="breadcrumb">
              <MuiLink component={Link} to="/student" underline="hover" color="inherit">
                Student
              </MuiLink>
              {breadcrumbItems}
            </Breadcrumbs>
          </div>
          
          <div className="mt-[90px] p-4 md:p-6 overflow-y-auto h-[calc(100vh-90px)]">
            <div className="ebook-dashboard">
              <h2>E-Library Dashboard</h2>

              <div className="filters">
                <input
                  type="text"
                  name="author"
                  placeholder="Filter by Author"
                  value={filters.author}
                  onChange={handleFilterChange}
                />
                <input
                  type="text"
                  name="category"
                  placeholder="Filter by Category"
                  value={filters.category}
                  onChange={handleFilterChange}
                />
                <input
                  type="date"
                  name="uploadDate"
                  value={filters.uploadDate}
                  onChange={handleFilterChange}
                />
              </div>

              {loading && <p>Loading eBooks...</p>}
              {error && <p className="error">{error}</p>}

              {!loading && !error && (
                <div className="ebook-list">
                  {eBooks.length === 0 ? (
                    <p>No eBooks available.</p>
                  ) : (
                    eBooks.map(eBook => (
                      <div key={eBook._id} className="ebook-card">
                        {eBook.coverPhotoUrl ? (
                          <img
                            src={eBook.coverPhotoUrl}
                            alt={eBook.title}
                            className="ebook-cover"
                          />
                        ) : (
                          <div className="no-cover">No Cover</div>
                        )}
                        <h3>{eBook.title}</h3>
                        <p><strong>Author:</strong> {eBook.author}</p>
                        <p><strong>Category:</strong> {eBook.category}</p>
                        <p><strong>Uploaded:</strong> {new Date(eBook.uploadDate).toLocaleDateString()}</p>
                        <p><strong>Downloads:</strong> {eBook.downloadCount}</p>
                        <button onClick={() => handleDownload(eBook._id)}>
                          Download
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EBookDashboard;