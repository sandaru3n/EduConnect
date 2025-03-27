import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Divider,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  AlertTitle,
  IconButton,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  Skeleton,
  Fade,
  Badge
} from "@mui/material";
import {
  School as SchoolIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Visibility as ViewIcon,
  MoreVert as MoreIcon,
  Close as CloseIcon,
  Group as GroupIcon,
  EventNote as ScheduleIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon
} from "@mui/icons-material";

const ViewAllClasses = () => {
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("alphabetical");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        const { data } = await axios.get(
          "http://localhost:5000/api/teacher/classes",
          config
        );

        setClasses(data);
        setLoading(false);
      } catch (error) {
        setError(error.response?.data?.message || "Error fetching classes");
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // Filter and sort classes when dependencies change
  useEffect(() => {
    let filtered = [...classes];

    // Apply status filter
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active";
      filtered = filtered.filter(cls => cls.isActive === isActive);
    }

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(cls =>
        cls.subject.toLowerCase().includes(search) ||
        (cls.description && cls.description.toLowerCase().includes(search))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortOrder) {
        case "alphabetical":
          return a.subject.localeCompare(b.subject);
        case "alphabeticalDesc":
          return b.subject.localeCompare(a.subject);
        case "feeAsc":
          return a.monthlyFee - b.monthlyFee;
        case "feeDesc":
          return b.monthlyFee - a.monthlyFee;
        case "newest":
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case "oldest":
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        default:
          return 0;
      }
    });

    setFilteredClasses(filtered);
  }, [classes, statusFilter, searchTerm, sortOrder]);

  const handleEdit = (classId) => {
    navigate(`/teacher/classes/${classId}/update`);
  };

  const handleView = (classId) => {
    navigate(`/teacher/classes/${classId}`);
  };

  const handleDelete = async (classId) => {
    if (window.confirm("Are you sure you want to delete this class? This action cannot be undone.")) {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        await axios.delete(
          `http://localhost:5000/api/teacher/classes/${classId}`,
          config
        );

        // Update classes state
        setClasses(classes.filter(cls => cls._id !== classId));

      } catch (error) {
        setError(error.response?.data?.message || "Error deleting class");
      }
    }
  };

  const handleMenuOpen = (event, classId) => {
    setAnchorEl(event.currentTarget);
    setSelectedClassId(classId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedClassId(null);
  };

  const getSortIcon = () => {
    if (sortOrder.includes("Desc") || sortOrder === "oldest") {
      return <ArrowDownIcon fontSize="small" />;
    }
    return <ArrowUpIcon fontSize="small" />;
  };

  // Mock total students data for each class
  const getRandomStudentCount = () => {
    return Math.floor(Math.random() * 15);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <Box>
            <Typography
              variant="h4"
              component="h1"
              className="text-2xl md:text-3xl font-bold text-gray-800"
              sx={{ mb: 1 }}
            >
              My Classes
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage your classes and course offerings
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={Link}
            to="/teacher/classes/create"
            sx={{
              boxShadow: 2,
              py: 1.5,
              px: 3,
              borderRadius: 1,
              bgcolor: "#4f46e5",
              '&:hover': {
                bgcolor: "#4338ca"
              }
            }}
          >
            Create New Class
          </Button>
        </Box>

        {/* Filter and Search Bar */}
        <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                placeholder="Search classes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                        onClick={() => setSearchTerm("")}
                        edge="end"
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ bgcolor: "white" }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Classes</MenuItem>
                  <MenuItem value="active">Active Only</MenuItem>
                  <MenuItem value="inactive">Inactive Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  label="Sort By"
                  endAdornment={<InputAdornment position="end">{getSortIcon()}</InputAdornment>}
                >
                  <MenuItem value="alphabetical">Name: A-Z</MenuItem>
                  <MenuItem value="alphabeticalDesc">Name: Z-A</MenuItem>
                  <MenuItem value="feeAsc">Fee: Low to High</MenuItem>
                  <MenuItem value="feeDesc">Fee: High to Low</MenuItem>
                  <MenuItem value="newest">Newest First</MenuItem>
                  <MenuItem value="oldest">Oldest First</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" color="text.secondary">
                  {filteredClasses.length} {filteredClasses.length === 1 ? 'class' : 'classes'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 4, borderRadius: 2 }}
        >
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Skeleton
                variant="rounded"
                height={250}
                animation="wave"
                sx={{ borderRadius: 2 }}
              />
            </Grid>
          ))}
        </Grid>
      ) : filteredClasses.length === 0 ? (
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
          <SchoolIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Classes Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your filters to see more results.'
              : 'Create your first class to get started.'}
          </Typography>
          {(searchTerm || statusFilter !== 'all') ? (
            <Button
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              startIcon={<FilterListIcon />}
            >
              Clear Filters
            </Button>
          ) : (
            <Button
              variant="contained"
              component={Link}
              to="/teacher/classes/create"
              startIcon={<AddIcon />}
              sx={{
                bgcolor: "#4f46e5",
                '&:hover': {
                  bgcolor: "#4338ca"
                }
              }}
            >
              Create Your First Class
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredClasses.map((classItem) => (
            <Grid item xs={12} sm={6} md={4} key={classItem._id}>
              <Fade in={true} timeout={300}>
                <Card
                  elevation={1}
                  sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 3
                    }
                  }}
                >
                  <Box
                    sx={{
                      height: 10,
                      bgcolor: classItem.isActive ? '#4ade80' : '#f87171'
                    }}
                  />

                  <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" component="h2" fontWeight="bold" gutterBottom>
                        {classItem.subject}
                      </Typography>

                      <IconButton
                        size="small"
                        onClick={(event) => handleMenuOpen(event, classItem._id)}
                        sx={{ mt: -1, mr: -1 }}
                      >
                        <MoreIcon fontSize="small" />
                      </IconButton>
                    </Box>

                    <Chip
                      label={classItem.isActive ? "Active" : "Inactive"}
                      size="small"
                      color={classItem.isActive ? "success" : "error"}
                      icon={classItem.isActive ? <ActiveIcon fontSize="small" /> : <InactiveIcon fontSize="small" />}
                      sx={{ mb: 2 }}
                    />

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <MoneyIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="h6" color="primary" fontWeight="bold">
                        ${classItem.monthlyFee}
                        <Typography component="span" variant="caption" color="text.secondary">
                          /month
                        </Typography>
                      </Typography>
                    </Box>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        height: 60
                      }}
                    >
                      {classItem.description || "No description available."}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <GroupIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          {getRandomStudentCount()} students
                        </Typography>
                      </Box>

                      {classItem.schedule && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ScheduleIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                          <Typography variant="body2" color="text.secondary">
                            {classItem.schedule}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>

                  <Divider />

                  <CardActions sx={{ p: 2, pt: 1.5, justifyContent: 'flex-end' }}>
                    <Button
                      size="small"
                      startIcon={<ViewIcon />}
                      onClick={() => handleView(classItem._id)}
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleEdit(classItem._id)}
                      sx={{ color: '#4f46e5' }}
                    >
                      Edit
                    </Button>
                  </CardActions>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Class Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => {
          handleView(selectedClassId);
          handleMenuClose();
        }}>
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => {
          handleEdit(selectedClassId);
          handleMenuClose();
        }}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Class
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            handleDelete(selectedClassId);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Class
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default ViewAllClasses;
