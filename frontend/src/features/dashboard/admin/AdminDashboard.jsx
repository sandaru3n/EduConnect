// frontend/src/features/dashboard/admin/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { Breadcrumbs, Link as MuiLink, Typography, Box, Paper, Grid, IconButton, Button, Divider, Avatar, Tooltip, LinearProgress, CircularProgress } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import AdminSidebar from "../../../components/AdminSidebar/index";
import AdminHeader from "../../../components/AdminHeader/index";

// Icons
import {
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  MenuBook as MenuBookIcon,
  Payment as PaymentIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  KeyboardArrowRight as ArrowRightIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Launch as LaunchIcon,
} from "@mui/icons-material";

// Mock data for dashboard
const statsData = [
  {
    id: 1,
    title: "Total Students",
    value: 2437,
    change: "+12%",
    trend: "up",
    icon: <PeopleIcon />,
    color: "#4f46e5"
  },
  {
    id: 2,
    title: "Total Revenue",
    value: "$18,423",
    change: "+23%",
    trend: "up",
    icon: <PaymentIcon />,
    color: "#0ea5e9"
  },
  {
    id: 3,
    title: "Active Courses",
    value: 72,
    change: "+5",
    trend: "up",
    icon: <MenuBookIcon />,
    color: "#10b981"
  },
  {
    id: 4,
    title: "Subscription Plans",
    value: 5,
    change: "0",
    trend: "neutral",
    icon: <AssignmentIcon />,
    color: "#f59e0b"
  },
];

const recentActivities = [
  {
    id: 1,
    user: "Jacob Wilson",
    action: "enrolled in",
    target: "Advanced Physics Course",
    time: "2 hours ago",
    avatar: "JW",
    targetType: "course"
  },
  {
    id: 2,
    user: "Emily Davis",
    action: "purchased",
    target: "Premium Subscription",
    time: "5 hours ago",
    avatar: "ED",
    targetType: "subscription"
  },
  {
    id: 3,
    user: "Michael Brown",
    action: "submitted",
    target: "Final Assignment",
    time: "Yesterday",
    avatar: "MB",
    targetType: "assignment"
  },
  {
    id: 4,
    user: "Sophia Martinez",
    action: "joined as",
    target: "New Teacher",
    time: "2 days ago",
    avatar: "SM",
    targetType: "user"
  },
  {
    id: 5,
    user: "William Johnson",
    action: "created",
    target: "Introduction to Chemistry",
    time: "3 days ago",
    avatar: "WJ",
    targetType: "course"
  }
];

const taskData = [
  {
    id: 1,
    title: "Review new course submissions",
    status: "pending",
    progress: 0,
    priority: "high",
    due: "Today"
  },
  {
    id: 2,
    title: "Update subscription pricing",
    status: "in-progress",
    progress: 60,
    priority: "medium",
    due: "Tomorrow"
  },
  {
    id: 3,
    title: "Respond to support tickets",
    status: "in-progress",
    progress: 35,
    priority: "high",
    due: "Today"
  },
  {
    id: 4,
    title: "Prepare monthly financial report",
    status: "pending",
    progress: 0,
    priority: "medium",
    due: "Next week"
  },
];

const quickLinks = [
  { title: "Add New Course", icon: <MenuBookIcon />, path: "/admin/courses/new" },
  { title: "Create Subscription", icon: <AssignmentIcon />, path: "/admin/subscription/new" },
  { title: "Add New User", icon: <PersonIcon />, path: "/admin/users/new" },
  { title: "View Reports", icon: <TrendingUpIcon />, path: "/admin/reports" },
];

const AdminDashboard = () => {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);

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

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
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

  // Get the current page name for the tab title
  const pageTitle = pathnames.length > 0
    ? pathnames[pathnames.length - 1].charAt(0).toUpperCase() + pathnames[pathnames.length - 1].slice(1)
    : "Dashboard"; // Default title if no pathnames

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

  // Get priority color
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high':
        return '#ef4444'; // Red
      case 'medium':
        return '#f59e0b'; // Amber
      case 'low':
        return '#10b981'; // Green
      default:
        return '#6b7280'; // Gray
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
                  Welcome back! Here's what's happening with your platform today.
                </Typography>
              </Box>

              <Box className="flex gap-2">
                <Tooltip title="Refresh data">
                  <IconButton
                    size="small"
                    sx={{ bgcolor: 'background.paper', boxShadow: 1 }}
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
                          height: '100%',
                          transition: 'transform 0.3s, box-shadow 0.3s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 3
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
                              bgcolor: `${stat.color}15`,
                              color: stat.color,
                              width: 48,
                              height: 48
                            }}
                          >
                            {stat.icon}
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
                        {recentActivities.map((activity, index) => (
                          <Box key={activity.id}>
                            <Box sx={{
                              display: 'flex',
                              p: 2.5,
                              '&:hover': { bgcolor: '#f9fafb' }
                            }}>
                              <Avatar
                                sx={{
                                  mr: 2,
                                  bgcolor: getAvatarColor(activity.avatar),
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
                        ))}
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
                          <Box sx={{
                            p: 2.5,
                            bgcolor: '#f9fafb',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              Pending Tasks
                            </Typography>
                            <Button
                              startIcon={<AddIcon fontSize="small" />}
                              size="small"
                              sx={{ color: '#4f46e5' }}
                            >
                              Add
                            </Button>
                          </Box>
                          <Box sx={{ maxHeight: 240, overflow: 'auto' }}>
                            {taskData.map((task, index) => (
                              <Box key={task.id}>
                                <Box sx={{
                                  p: 2,
                                  '&:hover': { bgcolor: '#f9fafb' }
                                }}>
                                  <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    mb: 1
                                  }}>
                                    <Typography variant="body2" fontWeight="medium">
                                      {task.title}
                                    </Typography>
                                    <Tooltip title={`Priority: ${task.priority}`}>
                                      <Box
                                        sx={{
                                          width: 10,
                                          height: 10,
                                          borderRadius: '50%',
                                          bgcolor: getPriorityColor(task.priority)
                                        }}
                                      />
                                    </Tooltip>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                    <LinearProgress
                                      variant="determinate"
                                      value={task.progress}
                                      sx={{
                                        flex: 1,
                                        height: 6,
                                        borderRadius: 1,
                                        bgcolor: '#e5e7eb',
                                        '& .MuiLinearProgress-bar': {
                                          bgcolor: '#4f46e5'
                                        }
                                      }}
                                    />
                                    <Typography variant="caption" color="text.secondary">
                                      {task.progress}%
                                    </Typography>
                                  </Box>
                                  <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                  }}>
                                    <Typography variant="caption" color="text.secondary">
                                      Due: {task.due}
                                    </Typography>
                                    <Button
                                      size="small"
                                      variant={task.status === 'pending' ? 'outlined' : 'contained'}
                                      color={task.status === 'pending' ? 'primary' : 'secondary'}
                                      sx={{
                                        py: 0.5,
                                        px: 1.5,
                                        borderRadius: 4,
                                        textTransform: 'capitalize',
                                        fontSize: '0.7rem',
                                        minWidth: 'unset'
                                      }}
                                    >
                                      {task.status}
                                    </Button>
                                  </Box>
                                </Box>
                                {index < taskData.length - 1 && <Divider />}
                              </Box>
                            ))}
                          </Box>
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