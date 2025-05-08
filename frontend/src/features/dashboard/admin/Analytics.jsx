import { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography, Grid, Paper, TextField } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import StudentSidebar from "../../../components/AdminSidebar/index";
import StudentHeader from "../../../components/AdminHeader/index";
import { Breadcrumbs, Link as MuiLink } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

// Colors for the pie chart
const COLORS = ['#4f46e5', '#10b981'];

const Analytics = () => {
    const location = useLocation();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [teacherRevenue, setTeacherRevenue] = useState([]);
    const [instituteRevenue, setInstituteRevenue] = useState([]);
    const [userDistribution, setUserDistribution] = useState([]);
    const [subscriptionTrends, setSubscriptionTrends] = useState([]);
    const [topSubscriptions, setTopSubscriptions] = useState([]);
    const [userGrowth, setUserGrowth] = useState([]);
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30))); // Last 30 days
    const [endDate, setEndDate] = useState(new Date());

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

    const fetchAnalyticsData = async () => {
        try {
            const params = {
                startDate: startDate.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0]
            };

            const [teacherRes, instituteRes, distributionRes, trendsRes, topSubsRes, growthRes] = await Promise.all([
                axios.get("http://localhost:5000/api/subscriptions/analytics/teacher-revenue", { params }),
                axios.get("http://localhost:5000/api/subscriptions/analytics/institute-revenue", { params }),
                axios.get("http://localhost:5000/api/subscriptions/analytics/user-distribution"),
                axios.get("http://localhost:5000/api/subscriptions/analytics/subscription-trends", { params }),
                axios.get("http://localhost:5000/api/subscriptions/analytics/top-subscriptions"),
                axios.get("http://localhost:5000/api/subscriptions/analytics/user-growth", { params })
            ]);

            setTeacherRevenue(teacherRes.data);
            setInstituteRevenue(instituteRes.data);
            setUserDistribution(distributionRes.data);
            setSubscriptionTrends(trendsRes.data);
            setTopSubscriptions(topSubsRes.data);
            setUserGrowth(growthRes.data);
        } catch (error) {
            console.error("Error fetching analytics data:", error);
        }
    };

    useEffect(() => {
        fetchAnalyticsData();
    }, [startDate, endDate]);

    const pathnames = location.pathname.split("/").filter((x) => x);
    const breadcrumbItems = pathnames.map((value, index) => {
        const last = index === pathnames.length - 1;
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const displayName = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');

        return last ? (
            <Typography
                key={to}
                sx={{
                    color: '#1f2937',
                    fontWeight: 'medium',
                    fontSize: { xs: '0.9rem', md: '1rem' },
                }}
            >
                {displayName}
            </Typography>
        ) : (
            <MuiLink
                key={to}
                component={Link}
                to={to}
                underline="none"
                sx={{
                    color: '#3b82f6',
                    fontWeight: 500,
                    fontSize: { xs: '0.9rem', md: '1rem' },
                    '&:hover': {
                        textDecoration: 'underline',
                    },
                }}
            >
                {displayName}
            </MuiLink>
        );
    });

    return (
        <div className="bg-gray-50 min-h-screen flex flex-col">
            <StudentHeader
                isSidebarCollapsed={isSidebarCollapsed}
                toggleSidebar={toggleSidebar}
                isMobile={isMobile}
            />
            <div className="flex flex-1 overflow-hidden">
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

                <main
                    className={`flex-1 transition-all duration-300 ${
                        isSidebarCollapsed ? "ml-[60px]" : "ml-[20%] md:ml-[280px]"
                    } flex flex-col`}
                >
                    <div
                        className={`py-3 px-4 md:px-6 fixed top-[64px] right-2 z-30 transition-all duration-300 ${
                            isSidebarCollapsed ? "ml-[60px] w-[calc(100%-60px)]" : "ml-[18%] w-[calc(100%-18%)] md:ml-[250px] md:w-[calc(100%-250px)]"
                        } bg-white border-b border-gray-200 shadow-sm`}
                    >
                        <Breadcrumbs
                            aria-label="breadcrumb"
                            separator={<span className="text-gray-400 mx-1">{'>'}</span>}
                            sx={{
                                '& .MuiBreadcrumbs-ol': {
                                    alignItems: 'center',
                                },
                            }}
                        >
                            {breadcrumbItems}
                        </Breadcrumbs>
                    </div>

                    <div className="mt-[120px] p-4 md:p-6 overflow-y-auto h-[calc(100vh-120px)]">
                        <Box sx={{ maxWidth: 1200, mx: "auto" }}>
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 600,
                                    color: '#1a202c',
                                    mb: 4,
                                    fontSize: { xs: '1.5rem', md: '2rem' },
                                }}
                            >
                                Analytics
                            </Typography>

                            {/* Date Range Picker */}
                            <Box sx={{ mb: 4, display: 'flex', gap: 2 }}>
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <DatePicker
                                        label="Start Date"
                                        value={startDate}
                                        onChange={(newValue) => setStartDate(newValue)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                sx={{
                                                    bgcolor: '#f9fafb',
                                                    borderRadius: 1,
                                                    '& .MuiOutlinedInput-root': {
                                                        py: 1,
                                                        fontSize: '1rem',
                                                    },
                                                }}
                                            />
                                        )}
                                    />
                                    <DatePicker
                                        label="End Date"
                                        value={endDate}
                                        onChange={(newValue) => setEndDate(newValue)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                sx={{
                                                    bgcolor: '#f9fafb',
                                                    borderRadius: 1,
                                                    '& .MuiOutlinedInput-root': {
                                                        py: 1,
                                                        fontSize: '1rem',
                                                    },
                                                }}
                                            />
                                        )}
                                    />
                                </LocalizationProvider>
                            </Box>

                            <Grid container spacing={3}>
                                {/* Teacher Subscription Revenue Chart */}
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1a202c' }}>
                                            Teacher Subscription Revenue
                                        </Typography>
                                        <LineChart width={500} height={300} data={teacherRevenue}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="revenue" stroke="#4f46e5" name="Revenue ($)" />
                                        </LineChart>
                                    </Paper>
                                </Grid>

                                {/* Institute Subscription Revenue Chart */}
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1a202c' }}>
                                            Institute Subscription Revenue
                                        </Typography>
                                        <LineChart width={500} height={300} data={instituteRevenue}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="revenue" stroke="#10b981" name="Revenue ($)" />
                                        </LineChart>
                                    </Paper>
                                </Grid>

                                {/* Total Teachers and Institutes Pie Chart */}
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1a202c' }}>
                                            User Distribution (Teachers vs Institutes)
                                        </Typography>
                                        <PieChart width={400} height={300}>
                                            <Pie
                                                data={userDistribution}
                                                cx={200}
                                                cy={150}
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {userDistribution.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </Paper>
                                </Grid>

                                {/* Subscription Trends Chart */}
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1a202c' }}>
                                            Subscription Trends
                                        </Typography>
                                        <LineChart width={500} height={300} data={subscriptionTrends}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="teachers" stroke="#4f46e5" name="Teachers" />
                                            <Line type="monotone" dataKey="institutes" stroke="#10b981" name="Institutes" />
                                        </LineChart>
                                    </Paper>
                                </Grid>

                                {/* Top Revenue-Generating Subscriptions Bar Chart */}
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1a202c' }}>
                                            Top Revenue-Generating Subscriptions
                                        </Typography>
                                        <BarChart width={500} height={300} data={topSubscriptions}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="plan" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="revenue" fill="#0ea5e9" name="Revenue ($)" />
                                        </BarChart>
                                    </Paper>
                                </Grid>

                                {/* User Growth Chart */}
                                <Grid item xs={12} md={6}>
                                    <Paper sx={{ p: 3, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1a202c' }}>
                                            User Growth Over Time
                                        </Typography>
                                        <LineChart width={500} height={300} data={userGrowth}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="teachers" stroke="#4f46e5" name="Teachers" />
                                            <Line type="monotone" dataKey="institutes" stroke="#10b981" name="Institutes" />
                                        </LineChart>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Box>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Analytics;