//frontend/src/features/dashboard/admin/Subscription.jsx

import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import AdminHeader from "../../../components/AdminHeader/index";
import {
  
  Breadcrumbs,
  Link as MuiLink,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import AdminSidebar from "../../../components/AdminSidebar/index"
import { fetchSubscriptions, createSubscription, deleteSubscription, updateSubscription } from '/src/services/api'; // Adjust path as needed



const SubscriptionPage = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const [subscriptions, setSubscriptions] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [newSubscription, setNewSubscription] = useState({
    plan: "",
    studentLimit: "",
    teacherAccounts: "",
    storage: "",
    support: "",
    price: "",
    status: "Active",
  });

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


  // Generate breadcrumbs based on the current path
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

  const loadSubscriptions = async () => {
    try {
      const data = await fetchSubscriptions();
      setSubscriptions(data);
    } catch (error) {
      console.error("Error loading subscriptions:", error);
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this subscription?")) {
      try {
        await deleteSubscription(id);
        await loadSubscriptions();
        alert("Subscription deleted successfully");
      } catch (error) {
        console.error("Error deleting subscription:", error);
        alert(error.message);
      }
    }
  };

  const handleOpenForm = () => setOpenForm(true);
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setEditMode(false);
    setCurrentSubscription(null);
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

  const handleSubmit = async () => {
    try {
      const subData = {
        plan: newSubscription.plan.trim(),
        studentLimit: Number(newSubscription.studentLimit),
        teacherAccounts: Number(newSubscription.teacherAccounts),
        storage: newSubscription.storage.trim(),
        support: newSubscription.support.trim(),
        price: parseFloat(newSubscription.price),
        status: newSubscription.status,
      };

      const requiredFields = [
        "plan",
        "studentLimit",
        "teacherAccounts",
        "storage",
        "support",
        "price",
      ];
      const missingFields = requiredFields.filter((field) => {
        const value = subData[field];
        return typeof value === "undefined" || value === null || value === "";
      });

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }

      if (editMode) {
        await updateSubscription(currentSubscription._id, subData);
        alert("Subscription updated successfully");
      } else {
        await createSubscription(subData);
        alert("Subscription created successfully");
      }

      handleCloseForm();
      await loadSubscriptions();
    } catch (error) {
      console.error("Save error:", error);
      alert(error.message || "Operation failed. Check console for details.");
    }
  };

  // Get the current page name for the tab title
  const pageTitle = pathnames.length > 0 
    ? pathnames[pathnames.length - 1].charAt(0).toUpperCase() + pathnames[pathnames.length - 1].slice(1)
    : "Dashboard"; // Default title if no pathnames

  // Update document title when location changes
  useEffect(() => {
    document.title = `${pageTitle} - Admin Panel`; // You can customize the format
  }, [location, pageTitle]);

  return (
    <div className="flex min-h-screen">
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
          className={`mt-[50px] py-2 px-4 md:px-6 bg-gray-100 border-b transition-all duration-300 z-30 fixed top-0 left-0 w-full ${
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
        <div className="mt-[90px] p-4 md:p-6 overflow-y-auto h-[calc(100vh-90px)]">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl md:text-2xl font-semibold !text-[rgba(0,0,0,0.8)]">Manage Subscription Plans</h1>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenForm}
              sx={{ backgroundColor: "#1976d2", "&:hover": { backgroundColor: "#115293" } }}
            >
              New Plan
            </Button>
          </div>

          {/* Table for Desktop, Card Layout for Mobile */}
          <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
            <Table id="subscription-table">
              <TableHead sx={{ bgcolor: "grey.100", display: { xs: "none", sm: "table-header-group" } }}>
                <TableRow>
                  <TableCell>Status</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Students</TableCell>
                  <TableCell>Teachers</TableCell>
                  <TableCell>Storage</TableCell>
                  <TableCell>Support</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subscriptions.map((subscription) => (
                  <TableRow key={subscription._id} className="subscription-row">
                    {/* Desktop Layout */}
                    <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                      <Chip
                        label={subscription.status}
                        color={subscription.status === "Active" ? "success" : "error"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", display: { xs: "none", sm: "table-cell" } }}>
                      {subscription.plan}
                    </TableCell>
                    <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                      {subscription.studentLimit}
                    </TableCell>
                    <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                      {subscription.teacherAccounts}
                    </TableCell>
                    <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                      {subscription.storage}
                    </TableCell>
                    <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                      {subscription.support}
                    </TableCell>
                    <TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>
                      ${subscription.price}
                    </TableCell>
                    <TableCell align="center" sx={{ display: { xs: "none", sm: "table-cell" } }}>
                      <IconButton
                        color="primary"
                        onClick={() => handleEdit(subscription)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(subscription._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>

                    {/* Mobile Layout */}
                    <TableCell sx={{ display: { xs: "block", sm: "none" }, p: 0 }}>
                      <div
                        className="subscription-card"
                        style={{
                          padding: "12px",
                          borderBottom: "1px solid #e0e0e0",
                          marginBottom: "8px",
                        }}
                      >
                        <div className="subscription-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {subscription.plan}
                          </Typography>
                          <Chip
                            label={subscription.status}
                            color={subscription.status === "Active" ? "success" : "error"}
                            size="small"
                          />
                        </div>
                        <div className="subscription-card-content" style={{ marginTop: "8px" }}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Students:</strong> {subscription.studentLimit}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Teachers:</strong> {subscription.teacherAccounts}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Storage:</strong> {subscription.storage}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Support:</strong> {subscription.support}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Price:</strong> ${subscription.price}
                          </Typography>
                        </div>
                        <div
                          className="subscription-card-actions"
                          style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px" }}
                        >
                          <IconButton
                            color="primary"
                            onClick={() => handleEdit(subscription)}
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(subscription._id)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Subscription Form Modal */}
          <Dialog open={openForm} onClose={handleCloseForm} fullWidth maxWidth="sm">
            <DialogTitle>{editMode ? "Edit Subscription" : "Add New Subscription"}</DialogTitle>
            <DialogContent>
              {["plan", "studentLimit", "teacherAccounts", "storage", "support", "price"].map(
                (field) => (
                  <TextField
                    key={field}
                    fullWidth
                    required
                    label={field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                    name={field}
                    value={newSubscription[field]}
                    onChange={handleInputChange}
                    margin="dense"
                    type={["studentLimit", "teacherAccounts", "price"].includes(field) ? "number" : "text"}
                  />
                )
              )}
              <TextField
                select
                fullWidth
                label="Status"
                name="status"
                value={newSubscription.status}
                onChange={handleInputChange}
                margin="dense"
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseForm}>Cancel</Button>
              <Button variant="contained" onClick={handleSubmit}>
                {editMode ? "Update" : "Add"}
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;