//frontend/src/features/dashboard/admin/Subscription.jsx
import { useState, useEffect } from "react";
import AdminHeader from "../../../components/AdminHeader/index";
import AdminSidebar from "../../../components/AdminSidebar/index";
import { Link, useLocation } from "react-router-dom";
import { fetchSubscriptions, createSubscription, deleteSubscription, updateSubscription } from '/src/services/api';

// Material UI imports
import {
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  MenuItem,
  InputAdornment,
  IconButton,
  Button,
  Tooltip,
  Box,
  Breadcrumbs,
  Link as MuiLink,
  Fade,
  Grow,
  Divider,
  Chip,
  Badge,
  Grid,
  Alert,
  CircularProgress,
  Snackbar,
} from "@mui/material";

// Icons
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Storage as StorageIcon,
  Support as SupportIcon,
  AttachMoney as MoneyIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

const SubscriptionPage = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("priceAsc");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [newSubscription, setNewSubscription] = useState({
    plan: "",
    studentLimit: "",
    teacherAccounts: "",
    storage: "",
    support: "",
    price: "",
    status: "Active",
  });
  const [formErrors, setFormErrors] = useState({});

  // Handle screen size detection
  useEffect(() => {
    const handleResize = () => {
      const mobileView = window.innerWidth <= 768;
      setIsMobile(mobileView);
      if (mobileView) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load subscriptions on mount
  useEffect(() => {
    loadSubscriptions();
  }, []);

  // Filter and sort subscriptions when dependencies change
  useEffect(() => {
    let filtered = [...subscriptions];

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(sub => sub.status === statusFilter);
    }

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(sub =>
        sub.plan.toLowerCase().includes(search) ||
        sub.support.toLowerCase().includes(search)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortOrder) {
        case "priceAsc":
          return a.price - b.price;
        case "priceDesc":
          return b.price - a.price;
        case "planAsc":
          return a.plan.localeCompare(b.plan);
        case "planDesc":
          return b.plan.localeCompare(a.plan);
        default:
          return 0;
      }
    });

    setFilteredSubscriptions(filtered);
  }, [subscriptions, statusFilter, searchTerm, sortOrder]);

  // Generate breadcrumbs based on the current path
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

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await fetchSubscriptions();
      setSubscriptions(data);
      showSnackbar("Subscription plans loaded successfully", "success");
    } catch (error) {
      console.error("Error loading subscriptions:", error);
      showSnackbar("Failed to load subscription plans", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, planName) => {
    if (window.confirm(`Are you sure you want to delete the "${planName}" subscription plan?`)) {
      try {
        setLoading(true);
        await deleteSubscription(id);
        await loadSubscriptions();
        showSnackbar(`"${planName}" plan deleted successfully`, "success");
      } catch (error) {
        console.error("Error deleting subscription:", error);
        showSnackbar(`Failed to delete "${planName}" plan`, "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleOpenForm = () => setOpenForm(true);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditMode(false);
    setCurrentSubscription(null);
    setFormErrors({});
    setNewSubscription({
      plan: "",
      studentLimit: "",
      teacherAccounts: "",
      storage: "",
      support: "",
      price: "",
      status: "Active",
    });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setNewSubscription((prev) => ({ ...prev, [name]: value }));

    // Clear validation error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleEdit = (subscription) => {
    setEditMode(true);
    setCurrentSubscription(subscription);
    setNewSubscription({
      ...subscription,
      studentLimit: subscription.studentLimit.toString(),
      teacherAccounts: subscription.teacherAccounts.toString(),
      price: subscription.price.toString(),
    });
    handleOpenForm();
  };

  const validateForm = () => {
    const errors = {};

    if (!newSubscription.plan.trim()) {
      errors.plan = "Plan name is required";
    }

    if (!newSubscription.studentLimit || isNaN(Number(newSubscription.studentLimit)) || Number(newSubscription.studentLimit) < 0) {
      errors.studentLimit = "Student limit must be a valid positive number";
    }

    if (!newSubscription.teacherAccounts || isNaN(Number(newSubscription.teacherAccounts)) || Number(newSubscription.teacherAccounts) < 0) {
      errors.teacherAccounts = "Teacher accounts must be a valid positive number";
    }

    if (!newSubscription.storage.trim()) {
      errors.storage = "Storage information is required";
    }

    if (!newSubscription.support.trim()) {
      errors.support = "Support information is required";
    }

    if (!newSubscription.price || isNaN(parseFloat(newSubscription.price)) || parseFloat(newSubscription.price) < 0) {
      errors.price = "Price must be a valid positive number";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const subData = {
        plan: newSubscription.plan.trim(),
        studentLimit: Number(newSubscription.studentLimit),
        teacherAccounts: Number(newSubscription.teacherAccounts),
        storage: newSubscription.storage.trim(),
        support: newSubscription.support.trim(),
        price: parseFloat(newSubscription.price),
        status: newSubscription.status,
      };

      if (editMode) {
        await updateSubscription(currentSubscription._id, subData);
        showSnackbar(`"${subData.plan}" plan updated successfully`, "success");
      } else {
        await createSubscription(subData);
        showSnackbar(`"${subData.plan}" plan created successfully`, "success");
      }

      handleCloseForm();
      await loadSubscriptions();
    } catch (error) {
      console.error("Save error:", error);
      showSnackbar(error.message || "Operation failed", "error");
    } finally {
      setLoading(false);
    }
  };

  // Get the current page name for the tab title
  const pageTitle = pathnames.length > 0
    ? pathnames[pathnames.length - 1].charAt(0).toUpperCase() + pathnames[pathnames.length - 1].slice(1)
    : "Dashboard"; // Default title if no pathnames

  // Update document title when location changes
  useEffect(() => {
    document.title = `${pageTitle} - Admin Panel`;
  }, [location, pageTitle]);

  // Function to get status chip color
  const getStatusColor = (status) => {
    return status === "Active" ? "success" : "error";
  };

  // Get sorting direction icon
  const getSortIcon = () => {
    if (sortOrder.includes("Asc")) {
      return "↑";
    }
    return "↓";
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Component */}
      <div
        className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 ${
          isSidebarCollapsed ? "w-[60px]" : "w-[18%] md:w-[250px]"
        }`}
      >
        <AdminSidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      </div>

      {/* Main Content Wrapper */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "ml-[60px]" : "ml-[18%] md:ml-[250px]"
        }`}
      >
        <AdminHeader
          isSidebarCollapsed={isSidebarCollapsed}
          toggleSidebar={toggleSidebar}
          isMobile={isMobile}
        />

        {/* Breadcrumbs */}
        <div
          className={`mt-[50px] py-3 px-6 bg-white border-b shadow-sm transition-all duration-300 z-30 fixed top-0 left-0 w-full ${
            isSidebarCollapsed
              ? "ml-[60px] w-[calc(100%-60px)]"
              : "ml-[18%] w-[calc(100%-18%)] md:ml-[250px] md:w-[calc(100%-250px)]"
          }`}
        >
          <Breadcrumbs aria-label="breadcrumb">
            <MuiLink component={Link} to="/admin" underline="hover" color="inherit">
              Admin
            </MuiLink>
            {breadcrumbItems}
          </Breadcrumbs>
        </div>

        {/* Main Content Area */}
        <div className="mt-[100px] p-6 md:p-8 overflow-y-auto h-[calc(100vh-100px)]">
          <Box className="mb-6">
            <Box className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
              <Typography
                variant="h4"
                className="text-2xl md:text-3xl font-bold text-gray-800"
                sx={{ mb: { xs: 1, sm: 0 } }}
              >
                Subscription Plans
                <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  {filteredSubscriptions.length} {filteredSubscriptions.length === 1 ? 'plan' : 'plans'}
                </Typography>
              </Typography>

              <Box className="flex gap-2">
                <Tooltip title="Refresh plans">
                  <IconButton
                    onClick={loadSubscriptions}
                    color="default"
                    disabled={loading}
                    size="small"
                    sx={{ bgcolor: 'background.paper', boxShadow: 1 }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : <RefreshIcon />}
                  </IconButton>
                </Tooltip>

                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleOpenForm}
                  sx={{
                    boxShadow: 3,
                    py: 1,
                    bgcolor: "#4f46e5",
                    '&:hover': { bgcolor: "#4338ca" }
                  }}
                >
                  New Plan
                </Button>
              </Box>
            </Box>

            <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    placeholder="Search plans..."
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
                  <TextField
                    select
                    fullWidth
                    label="Status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    size="small"
                    sx={{ bgcolor: "white" }}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    select
                    fullWidth
                    label="Sort By"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    size="small"
                    sx={{ bgcolor: "white" }}
                  >
                    <MenuItem value="priceAsc">Price: Low to High</MenuItem>
                    <MenuItem value="priceDesc">Price: High to Low</MenuItem>
                    <MenuItem value="planAsc">Plan Name: A-Z</MenuItem>
                    <MenuItem value="planDesc">Plan Name: Z-A</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Paper>
          </Box>

          {loading && subscriptions.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }} color="text.secondary">
                Loading subscription plans...
              </Typography>
            </Box>
          ) : filteredSubscriptions.length === 0 ? (
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
              <FilterListIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No Subscription Plans Found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your filters to see more results.'
                  : 'Create your first subscription plan to get started.'}
              </Typography>
              {(searchTerm || statusFilter !== 'all') && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  startIcon={<RefreshIcon />}
                >
                  Reset Filters
                </Button>
              )}
            </Paper>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredSubscriptions.map((subscription, index) => (
                <Grow
                  in={true}
                  key={subscription._id}
                  style={{ transformOrigin: '0 0 0' }}
                  timeout={(index + 1) * 100}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      borderRadius: 2,
                      overflow: 'hidden',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        boxShadow: 3,
                        transform: 'translateY(-4px)'
                      }
                    }}
                  >
                    <Box
                      sx={{
                        p: 0.5,
                        bgcolor: subscription.status === 'Active' ? '#4ade80' : '#f87171',
                      }}
                    />
                    <Box sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" component="h3" fontWeight="bold">
                          {subscription.plan}
                        </Typography>
                        <Chip
                          label={subscription.status}
                          color={getStatusColor(subscription.status)}
                          size="small"
                          sx={{ fontWeight: 'medium' }}
                        />
                      </Box>

                      <Typography variant="h5" component="p" fontWeight="bold" sx={{ mb: 3, color: '#4f46e5' }}>
                        ${subscription.price}
                        <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          /month
                        </Typography>
                      </Typography>

                      <Divider sx={{ mb: 2 }} />

                      <Box sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                          <PeopleIcon fontSize="small" color="action" sx={{ mr: 1.5 }} />
                          <Typography variant="body2">
                            <strong>{subscription.studentLimit}</strong> Students
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                          <PersonIcon fontSize="small" color="action" sx={{ mr: 1.5 }} />
                          <Typography variant="body2">
                            <strong>{subscription.teacherAccounts}</strong> Teacher Accounts
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                          <StorageIcon fontSize="small" color="action" sx={{ mr: 1.5 }} />
                          <Typography variant="body2">
                            <strong>{subscription.storage}</strong> Storage
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                          <SupportIcon fontSize="small" color="action" sx={{ mr: 1.5 }} />
                          <Typography variant="body2">
                            <strong>{subscription.support}</strong> Support
                          </Typography>
                        </Box>
                      </Box>

                      <Divider sx={{ mb: 2 }} />

                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Tooltip title="Edit plan">
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleEdit(subscription)}
                            startIcon={<EditIcon fontSize="small" />}
                            sx={{ borderRadius: 1 }}
                          >
                            Edit
                          </Button>
                        </Tooltip>

                        <Tooltip title="Delete plan">
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleDelete(subscription._id, subscription.plan)}
                            startIcon={<DeleteIcon fontSize="small" />}
                            sx={{ borderRadius: 1 }}
                          >
                            Delete
                          </Button>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Paper>
                </Grow>
              ))}
            </div>
          )}

          {/* Subscription Form Dialog */}
          <Dialog
            open={openForm}
            onClose={handleCloseForm}
            fullWidth
            maxWidth="sm"
            PaperProps={{
              sx: { borderRadius: 2 }
            }}
          >
            <DialogTitle sx={{
              bgcolor: '#4f46e5',
              color: 'white',
              py: 2,
            }}>
              {editMode ? `Edit ${currentSubscription?.plan} Plan` : "Create New Subscription Plan"}
            </DialogTitle>

            <DialogContent sx={{ p: 3, mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Plan Name"
                    name="plan"
                    value={newSubscription.plan}
                    onChange={handleInputChange}
                    error={!!formErrors.plan}
                    helperText={formErrors.plan}
                    autoFocus
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Student Limit"
                    name="studentLimit"
                    value={newSubscription.studentLimit}
                    onChange={handleInputChange}
                    type="number"
                    error={!!formErrors.studentLimit}
                    helperText={formErrors.studentLimit}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PeopleIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Teacher Accounts"
                    name="teacherAccounts"
                    value={newSubscription.teacherAccounts}
                    onChange={handleInputChange}
                    type="number"
                    error={!!formErrors.teacherAccounts}
                    helperText={formErrors.teacherAccounts}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Storage"
                    name="storage"
                    value={newSubscription.storage}
                    onChange={handleInputChange}
                    placeholder="e.g. 10GB"
                    error={!!formErrors.storage}
                    helperText={formErrors.storage}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <StorageIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    label="Price"
                    name="price"
                    value={newSubscription.price}
                    onChange={handleInputChange}
                    type="number"
                    error={!!formErrors.price}
                    helperText={formErrors.price}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MoneyIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: <InputAdornment position="end">/month</InputAdornment>,
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Support"
                    name="support"
                    value={newSubscription.support}
                    onChange={handleInputChange}
                    placeholder="e.g. 24/7 Email Support"
                    error={!!formErrors.support}
                    helperText={formErrors.support}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SupportIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Status"
                    name="status"
                    value={newSubscription.status}
                    onChange={handleInputChange}
                  >
                    <MenuItem value="Active">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CheckIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                        Active
                      </Box>
                    </MenuItem>
                    <MenuItem value="Inactive">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CloseIcon fontSize="small" color="error" sx={{ mr: 1 }} />
                        Inactive
                      </Box>
                    </MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
              <Button
                onClick={handleCloseForm}
                variant="outlined"
                sx={{ borderRadius: 1 }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{
                  borderRadius: 1,
                  bgcolor: "#4f46e5",
                  '&:hover': { bgcolor: "#4338ca" }
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  editMode ? "Update Plan" : "Create Plan"
                )}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar for notifications */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={5000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity={snackbar.severity}
              sx={{ width: '100%' }}
              variant="filled"
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;