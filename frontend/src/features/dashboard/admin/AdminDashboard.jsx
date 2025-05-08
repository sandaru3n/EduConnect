import { useState, useEffect } from "react";
import { Breadcrumbs, Link as MuiLink, Typography, Box, Paper, Grid, IconButton, Button, Divider, Avatar, Tooltip, LinearProgress, CircularProgress } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import AdminSidebar from "../../../components/AdminSidebar/index";
import AdminHeader from "../../../components/AdminHeader/index";
import axios from "axios";

// Icons
import {
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  MenuBook as MenuBookIcon,
  Payment as PaymentIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Notifications as NotificationsIcon,
  KeyboardArrowRight as ArrowRightIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

// Utility function to convert hex to RGBA
const hexToRGBA = (hex, alpha) => {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) {
    return `rgba(0, 0, 0, ${alpha})`; // Fallback
  }
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Define quickLinks array
const quickLinks = [
  { title: "Edit Pages", icon: <MenuBookIcon />, path: "/admin/pages" },
  { title: "Create Subscription", icon: <AssignmentIcon />, path: "/admin/subscription" },
  { title: "Manage Teachers", icon: <PersonIcon />, path: "/admin/teachers" },
  { title: "View Analytics", icon: <TrendingUpIcon />, path: "/admin/analytics" },
];

const AdminDashboard = () => {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]); // State for recent activities
  const [activityLoading, setActivityLoading] = useState(true); // Separate loading state for activities

  // Fetch dashboard metrics from the backend
  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get("http://localhost:5000/api/auth/dashboard/admin-metrics");
        setStatsData(data);
      } catch (err) {
        console.error("Error fetching dashboard metrics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  // Fetch recent users (teachers or institutes)
  useEffect(() => {
    const fetchRecentUsers = async () => {
      setActivityLoading(true);
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
        const { data } = await axios.get("http://localhost:5000/api/auth/admin/recent-users", config);
        setRecentActivities(data);
      } catch (err) {
        console.error("Error fetching recent users:", err);
        setRecentActivities([]); // Fallback to empty array on error
      } finally {
        setActivityLoading(false);
      }
    };

    fetchRecentUsers();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  useEffect(() => {
    const handleResize = () => {
      const mobileView = window.innerWidth <= 768;
      setIsMobile(mobileView);
      setIsSidebarCollapsed(mobileView); // Auto-collapse on mobile
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  // Map icon strings to actual MUI icons
  const getIconComponent = (iconName) => {
    switch (iconName) {
      case "PeopleIcon":
        return <PeopleIcon />;
      case "PaymentIcon":
        return <PaymentIcon />;
      case "MenuBookIcon":
        return <MenuBookIcon />;
      case "AssignmentIcon":
        return <AssignmentIcon />;
      default:
        return null;
    }
  };

  // Get the current page name for the tab title
  const pageTitle = pathnames.length > 0
    ? pathnames[pathnames.length - 1].charAt(0).toUpperCase() + pathnames[pathnames.length - 1].slice(1)
    : "Dashboard";

  // Update document title when location changes
  useEffect(() => {
    document.title = `${pageTitle} - Admin Panel`;
  }, [location, pageTitle]);

  // Get avatar background color based on name
  const getAvatarColor = (name) => {
    const colors = [
      '#4f46e5', '#0ea5e9', '#10b981', '#f59e0b',
      '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'
    ];

    const firstChar = name.charAt(0).toLowerCase();
    const charCode = firstChar.charCodeAt(0) - 97; // 'a' is 97 in ASCII
    const colorIndex = Math.abs(charCode) % colors.length;

    return colors[colorIndex];
  };

  // Get icon for activity type
  const getActivityIcon = (type) => {
    switch(type) {
      case 'course':
        return <MenuBookIcon fontSize="small" />;
      case 'subscription':
        return <PaymentIcon fontSize="small" />;
      case 'assignment':
        return <AssignmentIcon fontSize="small" />;
      case 'user':
        return <PersonIcon fontSize="small" />;
      default:
        return <NotificationsIcon fontSize="small" />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <AdminHeader
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
          <AdminSidebar
            isCollapsed={isSidebarCollapsed}
            toggleSidebar={toggleSidebar}
          />
        </div>

        <div
          className={`flex-1 transition-all duration-300 ${
            isSidebarCollapsed ? "ml-[60px]" : "ml-[18%] md:ml-[250px]"
          }`}
        >
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

          <div className="mt-[100px] p-6 md:p-8 overflow-y-auto h-[calc(100vh-100px)]">
            {/* Page Header */}
            <Box className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <Box>
                <Typography
                  variant="h4"
                  className="text-2xl md:text-3xl font-bold text-gray-800"
                >
                  Dashboard
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Welcome back! Here s what s happening with your platform today.
                </Typography>
              </Box>

              <Box className="flex gap-2">
                <Tooltip title="Refresh data">
                  <IconButton
                    size="small"
                    sx={{ bgcolor: 'background.paper', boxShadow: 1 }}
                    onClick={() => window.location.reload()} // Refresh the page to reload data
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }} color="text.secondary">
                  Loading dashboard data...
                </Typography>
              </Box>
            ) : (
              <>
                {/* Stats Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  {statsData.map((stat) => (
                    <Grid item xs={12} sm={6} md={3} key={stat.id}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          bgcolor: hexToRGBA(stat.color, 0.2),
                          height: '100%',
                          transition: 'transform 0.3s, box-shadow 0.3s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 3,
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography color="text.secondary" variant="body2" fontWeight="medium" gutterBottom>
                              {stat.title}
                            </Typography>
                            <Typography variant="h4" component="div" fontWeight="bold" sx={{ mb: 1 }}>
                              {stat.value}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: stat.trend === 'up' ? 'success.main' :
                                      stat.trend === 'down' ? 'error.main' :
                                      'text.secondary',
                                fontWeight: 'medium',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                            >
                              {stat.trend === 'up' && '↑ '}
                              {stat.trend === 'down' && '↓ '}
                              {stat.change} from last period
                            </Typography>
                          </Box>
                          <Avatar
                            sx={{
                              bgcolor: `white`,
                              color: stat.color,
                              width: 48,
                              height: 48
                            }}
                          >
                            {getIconComponent(stat.icon)}
                          </Avatar>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>

                <Grid container spacing={3}>
                  {/* Activities Section */}
                  <Grid item xs={12} md={8}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 0,
                        borderRadius: 2,
                        overflow: 'hidden',
                        height: '100%'
                      }}
                    >
                      <Box sx={{
                        p: 3,
                        bgcolor: '#f9fafb',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <Typography variant="h6" fontWeight="bold">
                          Recent Activity
                        </Typography>
                        <Button
                          endIcon={<ArrowRightIcon />}
                          size="small"
                          component={Link}
                          to="/admin/activities"
                          sx={{ color: '#4f46e5' }}
                        >
                          View All
                        </Button>
                      </Box>
                      <Box sx={{ maxHeight: 420, overflow: 'auto' }}>
                        {activityLoading ? (
                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                            <CircularProgress size={30} />
                            <Typography sx={{ ml: 2 }} color="text.secondary">
                              Loading recent activities...
                            </Typography>
                          </Box>
                        ) : recentActivities.length === 0 ? (
                          <Box sx={{ p: 3, textAlign: 'center' }}>
                            <Typography color="text.secondary">
                              No recent activities found.
                            </Typography>
                          </Box>
                        ) : (
                          recentActivities.map((activity, index) => (
                            <Box key={activity.id}>
                              <Box sx={{
                                display: 'flex',
                                p: 2.5,
                                '&:hover': { bgcolor: '#f9fafb' }
                              }}>
                                <Avatar
                                  sx={{
                                    mr: 2,
                                    bgcolor: getAvatarColor(activity.user),
                                    width: 40,
                                    height: 40,
                                    fontSize: '0.9rem'
                                  }}
                                >
                                  {activity.avatar}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="body2">
                                      <Box component="span" fontWeight="bold">
                                        {activity.user}
                                      </Box>{' '}
                                      {activity.action}{' '}
                                      <Box
                                        component="span"
                                        sx={{
                                          color: '#4f46e5',
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: 0.5
                                        }}
                                      >
                                        {getActivityIcon(activity.targetType)}
                                        {activity.target}
                                      </Box>
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {activity.time}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                              {index < recentActivities.length - 1 && <Divider />}
                            </Box>
                          ))
                        )}
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Right Column */}
                  <Grid item xs={12} md={4}>
                    <Grid container spacing={3} direction="column">
                      {/* Quick Links */}
                      <Grid item>
                        <Paper
                          elevation={0}
                          sx={{
                            borderRadius: 2,
                            overflow: 'hidden'
                          }}
                        >
                          <Box sx={{
                            p: 2.5,
                            bgcolor: '#4f46e5',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}>
                            <DashboardIcon />
                            <Typography variant="subtitle1" fontWeight="bold">
                              Quick Actions
                            </Typography>
                          </Box>
                          <Box>
                            {quickLinks.map((link, index) => (
                              <Box key={link.title}>
                                <Button
                                  component={Link}
                                  to={link.path}
                                  sx={{
                                    py: 1.5,
                                    px: 2.5,
                                    justifyContent: 'flex-start',
                                    color: 'text.primary',
                                    borderRadius: 0,
                                    width: '100%',
                                    '&:hover': {
                                      bgcolor: '#f9fafb'
                                    }
                                  }}
                                  startIcon={
                                    <Avatar
                                      sx={{
                                        width: 28,
                                        height: 28,
                                        bgcolor: '#4f46e5',
                                        mr: 1
                                      }}
                                    >
                                      {link.icon}
                                    </Avatar>
                                  }
                                  endIcon={<ArrowRightIcon />}
                                >
                                  {link.title}
                                </Button>
                                {index < quickLinks.length - 1 && <Divider />}
                              </Box>
                            ))}
                          </Box>
                        </Paper>
                      </Grid>

                      {/* Tasks */}
                      <Grid item>
                        <Paper
                          elevation={0}
                          sx={{
                            borderRadius: 2,
                            overflow: 'hidden'
                          }}
                        >
                        </Paper>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;