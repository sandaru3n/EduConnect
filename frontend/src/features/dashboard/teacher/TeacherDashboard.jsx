import { useState, useEffect } from "react";
import { Breadcrumbs, Link as MuiLink, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import TeacherSidebar from "../../../components/TeacherSidebar/index";
import TeacherHeader from "../../../components/TeacherHeader/index";
import axios from "axios";
import { motion } from "framer-motion";
import useAuth from "../../../hooks/useAuth";
import { 
  Chart as ChartJS, 
  ArcElement, 
  LineElement, 
  BarElement, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  Title, 
  Tooltip, 
  Legend 
} from "chart.js";
import { Pie, Line, Bar } from "react-chartjs-2";
import { Users, BookOpen, DollarSign, ClipboardList } from "lucide-react";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const TeacherDashboard = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for card data
    const [studentsSubscribed, setStudentsSubscribed] = useState(0);
    const [totalClasses, setTotalClasses] = useState(0);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [totalQuizzes, setTotalQuizzes] = useState(0);

    // State for chart data
    const [studentsPerClassData, setStudentsPerClassData] = useState({
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: [
                'rgba(59, 130, 246, 0.8)', // Sky Blue
                'rgba(16, 185, 129, 0.8)', // Emerald
                'rgba(245, 158, 11, 0.8)', // Amber
                'rgba(139, 92, 246, 0.8)', // Purple
            ],
            borderWidth: 1,
            borderColor: '#ffffff',
        }]
    });

    const [dailyRevenueData, setDailyRevenueData] = useState({
        labels: [],
        datasets: [{
            label: 'Daily Revenue ($)',
            data: [],
            fill: true,
            borderColor: 'rgba(16, 185, 129, 1)', // Emerald
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            tension: 0.4,
            pointBackgroundColor: 'rgba(16, 185, 129, 1)',
            pointBorderColor: '#ffffff',
            pointRadius: 5,
            pointHoverRadius: 7,
        }]
    });

    const [revenuePerClassData, setRevenuePerClassData] = useState({
        labels: [],
        datasets: [{
            label: 'Revenue ($)',
            data: [],
            backgroundColor: 'rgba(59, 130, 246, 0.8)', // Sky Blue
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1,
            hoverBackgroundColor: 'rgba(59, 130, 246, 1)',
        }]
    });

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

    // Fetch dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setError(null);
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` }
                };

                // Fetch number of students subscribed
                const { data: subscriptionData } = await axios.get("http://localhost:5000/api/auth/teacher/subscribed-students", config);
                setStudentsSubscribed(subscriptionData.length || 0);

                // Fetch total classes using the updated endpoint
                const { data: classesData } = await axios.get("http://localhost:5000/api/classes/teacher-classes-dashboard", config);
                setTotalClasses(classesData.length || 0);

                // Calculate total revenue
                const totalRev = subscriptionData.reduce((acc, sub) => acc + (sub.feePaid || 0), 0);
                setTotalRevenue(totalRev);

                // Fetch total quizzes
                const { data: quizzesData } = await axios.get("http://localhost:5000/api/quiz/teacher/history2", config);
                setTotalQuizzes(quizzesData.length || 0);

                // Students per class (Pie Chart)
                const classStudentCounts = {};
                subscriptionData.forEach(sub => {
                    const className = sub.classId?.subject || "Unknown";
                    classStudentCounts[className] = (classStudentCounts[className] || 0) + 1;
                });
                setStudentsPerClassData(prev => ({
                    ...prev,
                    labels: Object.keys(classStudentCounts),
                    datasets: [{
                        ...prev.datasets[0],
                        data: Object.values(classStudentCounts),
                    }]
                }));

                // Daily revenue (Line Chart)
                const dailyRevenue = {};
                subscriptionData.forEach(sub => {
                    const date = new Date(sub.createdAt).toISOString().split('T')[0];
                    dailyRevenue[date] = (dailyRevenue[date] || 0) + (sub.feePaid || 0);
                });
                const sortedDates = Object.keys(dailyRevenue).sort();
                setDailyRevenueData(prev => ({
                    ...prev,
                    labels: sortedDates,
                    datasets: [{
                        ...prev.datasets[0],
                        data: sortedDates.map(date => dailyRevenue[date]),
                    }]
                }));

                // Revenue per class (Bar Chart)
                const revenuePerClass = {};
                subscriptionData.forEach(sub => {
                    const className = sub.classId?.subject || "Unknown";
                    revenuePerClass[className] = (revenuePerClass[className] || 0) + (sub.feePaid || 0);
                });
                setRevenuePerClassData(prev => ({
                    ...prev,
                    labels: Object.keys(revenuePerClass),
                    datasets: [{
                        ...prev.datasets[0],
                        data: Object.values(revenuePerClass),
                    }]
                }));

            } catch (error) {
                console.error("Error fetching dashboard data:", error);
                setError("Failed to load dashboard data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [user.token]);

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
                    fontSize: { xs: '0.85rem', md: '0.875rem' },
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
                    fontSize: { xs: '0.85rem', md: '0.875rem' },
                    '&:hover': {
                        textDecoration: 'underline',
                    },
                }}
            >
                {displayName}
            </MuiLink>
        );
    });

    const pageTitle = pathnames.length > 0
        ? pathnames[pathnames.length - 1].charAt(0).toUpperCase() + pathnames[pathnames.length - 1].slice(1).replace(/-/g, ' ')
        : "Dashboard";

    useEffect(() => {
        document.title = `${pageTitle} - EduConnect`;
    }, [location, pageTitle]);

    return (
        <div className="min-h-screen bg-gray-100">
            <TeacherHeader
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
                    <TeacherSidebar
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
                            {location.pathname === "/teacher/dashboard" ? (
                                <Typography
                                    sx={{
                                        color: '#1f2937',
                                        fontWeight: 'medium',
                                        fontSize: { xs: '0.85rem', md: '0.875rem' },
                                    }}
                                >
                                    Dashboard
                                </Typography>
                            ) : (
                                <>
                                    <MuiLink
                                        component={Link}
                                        to="/teacher"
                                        underline="none"
                                        sx={{
                                            color: '#3b82f6',
                                            fontWeight: 500,
                                            fontSize: { xs: '0.85rem', md: '0.875rem' },
                                            '&:hover': {
                                                textDecoration: 'underline',
                                            },
                                        }}
                                    >
                                        Home
                                    </MuiLink>
                                    {breadcrumbItems}
                                </>
                            )}
                        </Breadcrumbs>
                    </div>

                    <div className="mt-[104px] p-6 md:p-8 overflow-y-auto h-[calc(100vh-104px)]">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="max-w-[1400px] mx-auto space-y-10"
                        >
                            <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">
                                Welcome to Your Teacher Dashboard
                            </h1>

                            {error ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-red-600 bg-red-50 p-4 rounded-lg text-center shadow-md"
                                >
                                    {error}
                                </motion.div>
                            ) : loading ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center text-indigo-600 font-semibold flex justify-center"
                                >
                                    <svg className="animate-spin h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </motion.div>
                            ) : (
                                <>
                                    {/* Cards Section */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                        {/* Card 1: Students Subscribed */}
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.3 }}
                                            className="bg-gradient-to-br from-indigo-100 to-indigo-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center space-x-4"
                                        >
                                            <div className="p-4 rounded-full bg-indigo-200">
                                                <Users className="w-8 h-8 text-indigo-700" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-600">Students Subscribed</h3>
                                                <motion.p
                                                    key={studentsSubscribed}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ duration: 0.5 }}
                                                    className="text-3xl font-bold text-indigo-800"
                                                >
                                                    {studentsSubscribed}
                                                </motion.p>
                                            </div>
                                        </motion.div>

                                        {/* Card 2: Total Classes */}
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.3, delay: 0.1 }}
                                            className="bg-gradient-to-br from-emerald-100 to-emerald-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center space-x-4"
                                        >
                                            <div className="p-4 rounded-full bg-emerald-200">
                                                <BookOpen className="w-8 h-8 text-emerald-700" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-600">Total Classes</h3>
                                                <motion.p
                                                    key={totalClasses}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ duration: 0.5 }}
                                                    className="text-3xl font-bold text-emerald-800"
                                                >
                                                    {totalClasses}
                                                </motion.p>
                                            </div>
                                        </motion.div>

                                        {/* Card 3: Total Revenue */}
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.3, delay: 0.2 }}
                                            className="bg-gradient-to-br from-sky-100 to-sky-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center space-x-4"
                                        >
                                            <div className="p-4 rounded-full bg-sky-200">
                                                <DollarSign className="w-8 h-8 text-sky-700" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-600">Total Revenue</h3>
                                                <motion.p
                                                    key={totalRevenue}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ duration: 0.5 }}
                                                    className="text-3xl font-bold text-sky-800"
                                                >
                                                    ${totalRevenue.toLocaleString()}
                                                </motion.p>
                                            </div>
                                        </motion.div>

                                        {/* Card 4: Total Quizzes */}
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.3, delay: 0.3 }}
                                            className="bg-gradient-to-br from-amber-100 to-amber-200 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center space-x-4"
                                        >
                                            <div className="p-4 rounded-full bg-amber-200">
                                                <ClipboardList className="w-8 h-8 text-amber-700" />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-gray-600">Total Quizzes</h3>
                                                <motion.p
                                                    key={totalQuizzes}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ duration: 0.5 }}
                                                    className="text-3xl font-bold text-amber-800"
                                                >
                                                    {totalQuizzes}
                                                </motion.p>
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Charts Section */}
                                    <div className="space-y-10">
                                        {/* Chart 1: Students per Class (Pie Chart) */}
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.5 }}
                                            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                                        >
                                            <h3 className="text-xl font-semibold text-gray-800 mb-6">Students per Class</h3>
                                            <div className="h-[300px]">
                                                {studentsPerClassData.labels.length > 0 ? (
                                                    <Pie
                                                        data={studentsPerClassData}
                                                        options={{
                                                            responsive: true,
                                                            maintainAspectRatio: false,
                                                            plugins: {
                                                                legend: {
                                                                    position: 'top',
                                                                    labels: {
                                                                        boxWidth: 12,
                                                                        padding: 20,
                                                                        font: { size: 14, weight: 'bold' },
                                                                        color: '#1f2937',
                                                                    }
                                                                },
                                                                tooltip: {
                                                                    backgroundColor: 'rgba(0,0,0,0.8)',
                                                                    titleFont: { size: 14, weight: 'bold' },
                                                                    bodyFont: { size: 14 },
                                                                    padding: 12,
                                                                    cornerRadius: 8,
                                                                }
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <p className="text-center text-gray-500 text-lg">No student data available</p>
                                                )}
                                            </div>
                                        </motion.div>

                                        {/* Chart 2: Daily Revenue (Line Chart) */}
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.5 }}
                                            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                                        >
                                            <h3 className="text-xl font-semibold text-gray-800 mb-6">Daily Revenue from Subscriptions</h3>
                                            <div className="h-[300px]">
                                                {dailyRevenueData.labels.length > 0 ? (
                                                    <Line
                                                        data={dailyRevenueData}
                                                        options={{
                                                            responsive: true,
                                                            maintainAspectRatio: false,
                                                            scales: {
                                                                y: {
                                                                    beginAtZero: true,
                                                                    title: {
                                                                        display: true,
                                                                        text: 'Revenue ($)',
                                                                        font: { size: 14, weight: 'bold' },
                                                                        color: '#1f2937',
                                                                    },
                                                                    ticks: {
                                                                        font: { size: 12 },
                                                                        color: '#6b7280',
                                                                    },
                                                                    grid: {
                                                                        color: 'rgba(0, 0, 0, 0.05)',
                                                                    },
                                                                },
                                                                x: {
                                                                    title: {
                                                                        display: true,
                                                                        text: 'Date',
                                                                        font: { size: 14, weight: 'bold' },
                                                                        color: '#1f2937',
                                                                    },
                                                                    ticks: {
                                                                        font: { size: 12 },
                                                                        color: '#6b7280',
                                                                    },
                                                                    grid: {
                                                                        display: false,
                                                                    },
                                                                }
                                                            },
                                                            plugins: {
                                                                legend: {
                                                                    position: 'top',
                                                                    labels: {
                                                                        boxWidth: 12,
                                                                        padding: 20,
                                                                        font: { size: 14, weight: 'bold' },
                                                                        color: '#1f2937',
                                                                    }
                                                                },
                                                                tooltip: {
                                                                    backgroundColor: 'rgba(0,0,0,0.8)',
                                                                    titleFont: { size: 14, weight: 'bold' },
                                                                    bodyFont: { size: 14 },
                                                                    padding: 12,
                                                                    cornerRadius: 8,
                                                                }
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <p className="text-center text-gray-500 text-lg">No revenue data available</p>
                                                )}
                                            </div>
                                        </motion.div>

                                        {/* Chart 3: Revenue per Class (Bar Chart) */}
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.5 }}
                                            className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                                        >
                                            <h3 className="text-xl font-semibold text-gray-800 mb-6">Revenue per Class</h3>
                                            <div className="h-[300px]">
                                                {revenuePerClassData.labels.length > 0 ? (
                                                    <Bar
                                                        data={revenuePerClassData}
                                                        options={{
                                                            responsive: true,
                                                            maintainAspectRatio: false,
                                                            scales: {
                                                                y: {
                                                                    beginAtZero: true,
                                                                    title: {
                                                                        display: true,
                                                                        text: 'Revenue ($)',
                                                                        font: { size: 14, weight: 'bold' },
                                                                        color: '#1f2937',
                                                                    },
                                                                    ticks: {
                                                                        font: { size: 12 },
                                                                        color: '#6b7280',
                                                                    },
                                                                    grid: {
                                                                        color: 'rgba(0, 0, 0, 0.05)',
                                                                    },
                                                                },
                                                                x: {
                                                                    title: {
                                                                        display: true,
                                                                        text: 'Class',
                                                                        font: { size: 14, weight: 'bold' },
                                                                        color: '#1f2937',
                                                                    },
                                                                    ticks: {
                                                                        font: { size: 12 },
                                                                        color: '#6b7280',
                                                                    },
                                                                    grid: {
                                                                        display: false,
                                                                    },
                                                                }
                                                            },
                                                            plugins: {
                                                                legend: { display: false },
                                                                tooltip: {
                                                                    backgroundColor: 'rgba(0,0,0,0.8)',
                                                                    titleFont: { size: 14, weight: 'bold' },
                                                                    bodyFont: { size: 14 },
                                                                    padding: 12,
                                                                    cornerRadius: 8,
                                                                }
                                                            }
                                                        }}
                                                    />
                                                ) : (
                                                    <p className="text-center text-gray-500 text-lg">No revenue data available</p>
                                                )}
                                            </div>
                                        </motion.div>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;