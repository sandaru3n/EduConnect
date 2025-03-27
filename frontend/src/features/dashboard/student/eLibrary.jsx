import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Breadcrumbs,
  Link as MuiLink,
  Typography,
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Skeleton,
  Alert,
  Tooltip,
  Badge,
  CircularProgress
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import StudentSidebar from "../../../components/StudentSidebar/index";
import StudentHeader from "../../../components/StudentHeader/index";
import {
  Search as SearchIcon,
  Close as CloseIcon,
  CloudDownload as DownloadIcon,
  FilterList as FilterIcon,
  Book as BookIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Bookmark as BookmarkIcon,
  MenuBook as MenuBookIcon,
  ArrowDownward as ArrowDownwardIcon,
  ArrowUpward as ArrowUpwardIcon,
  Info as InfoIcon,
  Check as CheckIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

const EBookDashboard = () => {
  const [eBooks, setEBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [filters, setFilters] = useState({ author: '', category: '', uploadDate: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [downloading, setDownloading] = useState(null);
  const [viewingEBookId, setViewingEBookId] = useState(null); // Added state for viewing

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
      <Typography key={to} color="text.primary" fontWeight="medium">
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
  }, []);

  // Apply filters and sorting when dependencies change
  useEffect(() => {
    if (eBooks.length === 0) return;

    let filtered = [...eBooks];

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(book =>
        book.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Apply author filter
    if (filters.author) {
      filtered = filtered.filter(book =>
        book.author.toLowerCase() === filters.author.toLowerCase()
      );
    }

    // Apply date filter
    if (filters.uploadDate) {
      const filterDate = new Date(filters.uploadDate);
      filtered = filtered.filter(book => {
        const bookDate = new Date(book.uploadDate);
        return bookDate.toDateString() === filterDate.toDateString();
      });
    }

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(search) ||
        book.author.toLowerCase().includes(search) ||
        book.category.toLowerCase().includes(search)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.uploadDate) - new Date(a.uploadDate);
        case 'oldest':
          return new Date(a.uploadDate) - new Date(b.uploadDate);
        case 'titleAsc':
          return a.title.localeCompare(b.title);
        case 'titleDesc':
          return b.title.localeCompare(a.title);
        case 'mostDownloaded':
          return b.downloadCount - a.downloadCount;
        default:
          return 0;
      }
    });

    setFilteredBooks(filtered);
  }, [eBooks, filters, searchTerm, sortBy]);

  const fetchEBooks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/ebooks');
      setEBooks(response.data);

      // Extract unique categories and authors for filters
      const uniqueCategories = [...new Set(response.data.map(book => book.category))];
      const uniqueAuthors = [...new Set(response.data.map(book => book.author))];

      setCategories(uniqueCategories);
      setAuthors(uniqueAuthors);
      setError(null);
    } catch (err) {
      console.error('Error fetching eBooks:', err);
      setError('Failed to load eBooks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters({ ...filters, [name]: value });
  };

  const resetFilters = () => {
    setFilters({ author: '', category: '', uploadDate: '' });
    setSearchTerm('');
  };

  const handleDownload = async (id) => {
    try {
      setDownloading(id);
      window.open(`http://localhost:5000/api/ebooks/download/${id}`, '_blank');

      // Update download count after a brief delay
      setTimeout(async () => {
        await fetchEBooks();
        setDownloading(null);
      }, 1500);
    } catch (error) {
      console.error('Download error:', error);
      setError('Error downloading eBook. Please try again.');
      setDownloading(null);
    }
  };

  // Handle View Online button click
  const handleViewOnline = (id) => {
    setViewingEBookId(id);
  };

  // Handle returning to the eBook list
  const handleBackToList = () => {
    setViewingEBookId(null);
  };

  // Calculate cover background color based on category
  const getCategoryColor = (category) => {
    if (!category) return '#6b7280'; // gray-500

    const colors = {
      'Fiction': '#3b82f6', // blue-500
      'Science': '#10b981', // emerald-500
      'History': '#f59e0b', // amber-500
      'Mathematics': '#8b5cf6', // violet-500
      'Programming': '#ef4444', // red-500
      'Business': '#06b6d4', // cyan-500
      'Philosophy': '#ec4899', // pink-500
      'Psychology': '#14b8a6', // teal-500
      'Religion': '#64748b', // slate-500
      'Self-Help': '#a855f7', // purple-500
    };

    const lowerCategory = category.toLowerCase();
    for (const [key, value] of Object.entries(colors)) {
      if (lowerCategory.includes(key.toLowerCase())) {
        return value;
      }
    }

    const firstChar = category.charAt(0).toLowerCase();
    const charCode = firstChar.charCodeAt(0) - 97;
    const colorKeys = Object.keys(colors);
    const colorIndex = Math.abs(charCode) % colorKeys.length;

    return colors[colorKeys[colorIndex]];
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
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
            className={`mt-[50px] py-3 px-6 bg-white border-b shadow-sm transition-all duration-300 z-30 fixed top-0 left-0 w-full ${
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

          <div className="mt-[100px] p-6 md:p-8 overflow-y-auto h-[calc(100vh-100px)]">
            {viewingEBookId ? (
              <Box>
                <Button
                  variant="outlined"
                  onClick={handleBackToList}
                  sx={{ mb: 2 }}
                  startIcon={<BookIcon />}
                >
                  Back to Library
                </Button>
                <iframe
                  src={`http://localhost:5000/uploads/ebooks/${eBooks.find(eBook => eBook._id === viewingEBookId).filePath.split('/').pop()}`}
                  width="100%"
                  height="600px"
                  title={eBooks.find(eBook => eBook._id === viewingEBookId).title}
                  style={{ border: 'none', borderRadius: '8px' }}
                />
              </Box>
            ) : (
              <>
                <Box className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                  <Box>
                    <Typography
                      variant="h4"
                      className="text-2xl md:text-3xl font-bold text-gray-800"
                      sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                      <MenuBookIcon fontSize="large" sx={{ color: '#4f46e5' }} />
                      Student E-Library
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      Browse and download educational materials for your studies
                    </Typography>
                  </Box>
                </Box>

                <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={5}>
                      <TextField
                        fullWidth
                        placeholder="Search by title, author, or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        variant="outlined"
                        size="small"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon fontSize="small" color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: searchTerm && (
                            <InputAdornment position="end">
                              <IconButton
                                size="small"
                                onClick={() => setSearchTerm('')}
                                edge="end"
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel id="category-filter-label">Category</InputLabel>
                        <Select
                          labelId="category-filter-label"
                          value={filters.category}
                          onChange={(e) => handleFilterChange('category', e.target.value)}
                          label="Category"
                          startAdornment={
                            <InputAdornment position="start">
                              <CategoryIcon fontSize="small" color="action" />
                            </InputAdornment>
                          }
                        >
                          <MenuItem value="">All Categories</MenuItem>
                          {categories.map(category => (
                            <MenuItem key={category} value={category}>{category}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel id="author-filter-label">Author</InputLabel>
                        <Select
                          labelId="author-filter-label"
                          value={filters.author}
                          onChange={(e) => handleFilterChange('author', e.target.value)}
                          label="Author"
                          startAdornment={
                            <InputAdornment position="start">
                              <PersonIcon fontSize="small" color="action" />
                            </InputAdornment>
                          }
                        >
                          <MenuItem value="">All Authors</MenuItem>
                          {authors.map(author => (
                            <MenuItem key={author} value={author}>{author}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <FormControl fullWidth size="small">
                          <InputLabel id="sort-by-label">Sort By</InputLabel>
                          <Select
                            labelId="sort-by-label"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            label="Sort By"
                          >
                            <MenuItem value="newest">Newest First</MenuItem>
                            <MenuItem value="oldest">Oldest First</MenuItem>
                            <MenuItem value="titleAsc">Title: A-Z</MenuItem>
                            <MenuItem value="titleDesc">Title: Z-A</MenuItem>
                            <MenuItem value="mostDownloaded">Most Downloaded</MenuItem>
                          </Select>
                        </FormControl>

                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={resetFilters}
                          disabled={!searchTerm && !filters.category && !filters.author && !filters.uploadDate}
                          sx={{ minWidth: 'auto' }}
                        >
                          <FilterIcon />
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>

                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'} available
                  </Typography>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mb: 4 }}>
                    {error}
                  </Alert>
                )}

                {loading ? (
                  <Grid container spacing={3}>
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={item}>
                        <Skeleton
                          variant="rectangular"
                          height={300}
                          sx={{ borderRadius: 2 }}
                          animation="wave"
                        />
                      </Grid>
                    ))}
                  </Grid>
                ) : filteredBooks.length === 0 ? (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 6,
                      borderRadius: 2,
                      textAlign: 'center',
                      border: '1px dashed #ccc',
                      bgcolor: 'white'
                    }}
                  >
                    <BookIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      No eBooks Found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      {searchTerm || filters.category || filters.author || filters.uploadDate
                        ? 'Try adjusting your filters to see more results.'
                        : 'There are no eBooks available in the library at the moment.'}
                    </Typography>
                    {(searchTerm || filters.category || filters.author || filters.uploadDate) && (
                      <Button
                        variant="outlined"
                        onClick={resetFilters}
                        startIcon={<FilterIcon />}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </Paper>
                ) : (
                  <Grid container spacing={3}>
                    {filteredBooks.map(eBook => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={eBook._id}>
                        <Card
                          elevation={1}
                          sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: 2,
                            overflow: 'hidden',
                            transition: 'transform 0.3s, box-shadow 0.3s',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: 3
                            }
                          }}
                        >
                          {eBook.coverPhotoUrl ? (
                            <CardMedia
                              component="img"
                              height="200"
                              image={eBook.coverPhotoUrl}
                              alt={eBook.title}
                              sx={{ objectFit: 'cover' }}
                            />
                          ) : (
                            <Box
                              sx={{
                                height: 200,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                backgroundColor: getCategoryColor(eBook.category) + '15',
                                position: 'relative',
                                overflow: 'hidden'
                              }}
                            >
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: -30,
                                  left: -20,
                                  opacity: 0.15,
                                  transform: 'rotate(-20deg)',
                                  fontSize: 120
                                }}
                              >
                                <BookIcon fontSize="inherit" sx={{ color: getCategoryColor(eBook.category) }} />
                              </Box>
                              <Typography
                                variant="h5"
                                component="div"
                                sx={{
                                  color: getCategoryColor(eBook.category),
                                  fontWeight: 'bold',
                                  textAlign: 'center',
                                  px: 2,
                                  zIndex: 1
                                }}
                              >
                                {eBook.title}
                              </Typography>
                            </Box>
                          )}

                          <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                            <Typography
                              variant="h6"
                              component="div"
                              gutterBottom
                              sx={{
                                fontWeight: 'bold',
                                display: '-webkit-box',
                                WebkitBoxOrient: 'vertical',
                                WebkitLineClamp: 2,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                height: 48
                              }}
                            >
                              {eBook.title}
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <PersonIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                              <Typography variant="body2" color="text.secondary">
                                {eBook.author}
                              </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <CategoryIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                              <Chip
                                label={eBook.category}
                                size="small"
                                sx={{
                                  bgcolor: getCategoryColor(eBook.category) + '15',
                                  color: getCategoryColor(eBook.category),
                                  fontWeight: 'medium'
                                }}
                              />
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <CalendarIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                              <Typography variant="body2" color="text.secondary">
                                {formatDate(eBook.uploadDate)}
                              </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <DownloadIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                              <Typography variant="body2" color="text.secondary">
                                {eBook.downloadCount} {eBook.downloadCount === 1 ? 'download' : 'downloads'}
                              </Typography>
                            </Box>
                          </CardContent>

                          <Divider />

                          <CardActions sx={{ p: 2, pt: 1, justifyContent: 'space-between' }}>
                            <Button
                              variant="contained"
                              startIcon={downloading === eBook._id ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                              onClick={() => handleDownload(eBook._id)}
                              disabled={downloading === eBook._id}
                              sx={{
                                borderRadius: 1,
                                bgcolor: "#4f46e5",
                                '&:hover': { bgcolor: "#4338ca" },
                                flex: 1,
                                mr: 1
                              }}
                            >
                              {downloading === eBook._id ? 'Downloading...' : 'Download'}
                            </Button>
                            <Button
                              variant="outlined"
                              startIcon={<VisibilityIcon />}
                              onClick={() => handleViewOnline(eBook._id)}
                              sx={{
                                borderRadius: 1,
                                flex: 1,
                                ml: 1,
                                color: "#4f46e5",
                                borderColor: "#4f46e5",
                                '&:hover': {
                                  borderColor: "#4338ca",
                                  color: "#4338ca"
                                }
                              }}
                            >
                              View
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EBookDashboard;