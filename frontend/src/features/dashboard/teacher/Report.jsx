import { useState, useEffect, Component } from "react";
import { Breadcrumbs, Link as MuiLink, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import TeacherSidebar from "../../../components/TeacherSidebar/index";
import TeacherHeader from "../../../components/TeacherHeader/index";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../../../hooks/useAuth";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable"; // Import the autotable plugin

// Error Boundary Component
class ErrorBoundary extends Component {
  state = { hasError: false, errorMessage: "" };

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught in ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-red-600 bg-red-100 p-3 rounded-md text-center shadow-sm max-w-lg mx-auto">
          An error occurred: {this.state.errorMessage}. Please try refreshing the page.
        </div>
      );
    }
    return this.props.children;
  }
}

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [filteredQuizAttempts, setFilteredQuizAttempts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Filter states for Subscribed Students
  const [showSubFilter, setShowSubFilter] = useState(false);
  const [subFilters, setSubFilters] = useState({
    studentName: "",
    class: "",
    status: "",
    paymentDateStart: "",
    paymentDateEnd: "",
  });

  // Filter states for Quiz Marks
  const [showQuizFilter, setShowQuizFilter] = useState(false);
  const [quizFilters, setQuizFilters] = useState({
    studentName: "",
    class: "",
    quizTitle: "",
    percentageMin: "",
    percentageMax: "",
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` },
        };

        // Fetch subscribed students
        const { data: subscriptionData } = await axios.get(
          "http://localhost:5000/api/auth/teacher/subscribed-students",
          config
        );
        setSubscriptions(subscriptionData);
        setFilteredSubscriptions(subscriptionData);

        // Fetch quiz attempts
        const { data: quizData } = await axios.get(
          "http://localhost:5000/api/auth/teacher/quiz-attempts",
          config
        );
        setQuizAttempts(quizData);
        setFilteredQuizAttempts(quizData);
      } catch (err) {
        setError(err.response?.data?.message || "Error loading report data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.token]);

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
      <MuiLink key={to} component={Link} to={to} underline="hover" color="inherit">
        {displayName}
      </MuiLink>
    );
  });

  const pageTitle =
    pathnames.length > 0
      ? pathnames[pathnames.length - 1].charAt(0).toUpperCase() +
        pathnames[pathnames.length - 1].slice(1)
      : "Dashboard";

  useEffect(() => {
    document.title = `TeacherDashboard - EduConnect`;
  }, [location, pageTitle]);

  // Filter logic for Subscribed Students
  const handleSubFilterChange = (e) => {
    const { name, value } = e.target;
    setSubFilters({ ...subFilters, [name]: value });
  };

  const applySubFilters = () => {
    let filtered = [...subscriptions];

    if (subFilters.studentName) {
      filtered = filtered.filter((sub) =>
        sub.userId?.name?.toLowerCase().includes(subFilters.studentName.toLowerCase())
      );
    }

    if (subFilters.class) {
      filtered = filtered.filter((sub) =>
        sub.classId?.subject?.toLowerCase().includes(subFilters.class.toLowerCase())
      );
    }

    if (subFilters.status) {
      filtered = filtered.filter((sub) => sub.status === subFilters.status);
    }

    if (subFilters.paymentDateStart) {
      filtered = filtered.filter(
        (sub) => new Date(sub.createdAt) >= new Date(subFilters.paymentDateStart)
      );
    }

    if (subFilters.paymentDateEnd) {
      filtered = filtered.filter(
        (sub) => new Date(sub.createdAt) <= new Date(subFilters.paymentDateEnd)
      );
    }

    setFilteredSubscriptions(filtered);
    setShowSubFilter(false);
  };

  const resetSubFilters = () => {
    setSubFilters({
      studentName: "",
      class: "",
      status: "",
      paymentDateStart: "",
      paymentDateEnd: "",
    });
    setFilteredSubscriptions(subscriptions);
    setShowSubFilter(false);
  };

  // Filter logic for Quiz Marks
  const handleQuizFilterChange = (e) => {
    const { name, value } = e.target;
    setQuizFilters({ ...quizFilters, [name]: value });
  };

  const applyQuizFilters = () => {
    let filtered = [...quizAttempts];

    if (quizFilters.studentName) {
      filtered = filtered.filter((attempt) =>
        attempt.studentId?.name
          ?.toLowerCase()
          .includes(quizFilters.studentName.toLowerCase())
      );
    }

    if (quizFilters.class) {
      filtered = filtered.filter((attempt) =>
        attempt.quizId?.classId?.subject
          ?.toLowerCase()
          .includes(quizFilters.class.toLowerCase())
      );
    }

    if (quizFilters.quizTitle) {
      filtered = filtered.filter((attempt) =>
        attempt.quizId?.lessonName
          ?.toLowerCase()
          .includes(quizFilters.quizTitle.toLowerCase())
      );
    }

    if (quizFilters.percentageMin) {
      filtered = filtered.filter((attempt) => {
        const percentage = (attempt.marks / attempt.totalMarks) * 100;
        return percentage >= Number(quizFilters.percentageMin);
      });
    }

    if (quizFilters.percentageMax) {
      filtered = filtered.filter((attempt) => {
        const percentage = (attempt.marks / attempt.totalMarks) * 100;
        return percentage <= Number(quizFilters.percentageMax);
      });
    }

    setFilteredQuizAttempts(filtered);
    setShowQuizFilter(false);
  };

  const resetQuizFilters = () => {
    setQuizFilters({
      studentName: "",
      class: "",
      quizTitle: "",
      percentageMin: "",
      percentageMax: "",
    });
    setFilteredQuizAttempts(quizAttempts);
    setShowQuizFilter(false);
  };

  // Export to XLSX for Subscribed Students
  const exportSubToXLSX = () => {
    const data = filteredSubscriptions.map((sub) => ({
      "Student Name": sub.userId?.name || "N/A",
      Email: sub.userId?.email || "N/A",
      Class: sub.classId?.subject || "N/A",
      "Fee Paid": sub.feePaid,
      "Payment Date": new Date(sub.createdAt).toLocaleDateString(),
      Status: sub.status,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Subscribed Students");
    XLSX.writeFile(wb, "Subscribed_Students.xlsx");
  };

  // Export to XLSX for Quiz Marks
  const exportQuizToXLSX = () => {
    const data = filteredQuizAttempts.map((attempt) => {
      const percentage =
        attempt.totalMarks > 0
          ? ((attempt.marks / attempt.totalMarks) * 100).toFixed(2)
          : 0;
      return {
        "Student Name": attempt.studentId?.name || "N/A",
        Class: attempt.quizId?.classId?.subject || "N/A",
        "Quiz Title": attempt.quizId?.lessonName || "N/A",
        Marks: attempt.marks,
        "Total Marks": attempt.totalMarks,
        Percentage: `${percentage}%`,
        "Attempted At": new Date(attempt.attemptedAt).toLocaleString(),
      };
    });
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Quiz Marks");
    XLSX.writeFile(wb, "Quiz_Marks.xlsx");
  };

  // Generate PDF for Subscribed Students using jsPDF
  const generateSubPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Subscribed Students Report", 14, 22);

    const tableColumn = [
      "Student Name",
      "Email",
      "Class",
      "Fee Paid",
      "Payment Date",
      "Status",
    ];
    const tableRows = filteredSubscriptions.map((sub) => [
      sub.userId?.name || "N/A",
      sub.userId?.email || "N/A",
      sub.classId?.subject || "N/A",
      sub.feePaid,
      new Date(sub.createdAt).toLocaleDateString(),
      sub.status,
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: "grid",
      headStyles: { fillColor: [79, 70, 229] }, // Indigo color
      styles: { fontSize: 10, cellPadding: 3 },
    });

    doc.save("Subscribed_Students.pdf");
  };

  // Generate PDF for Quiz Marks using jsPDF
  const generateQuizPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Quiz Marks Report (Top Scores First)", 14, 22);

    const tableColumn = [
      "Student Name",
      "Class",
      "Quiz Title",
      "Marks",
      "Total Marks",
      "Percentage",
      "Attempted At",
    ];
    const tableRows = filteredQuizAttempts.map((attempt) => {
      const percentage =
        attempt.totalMarks > 0
          ? ((attempt.marks / attempt.totalMarks) * 100).toFixed(2)
          : 0;
      return [
        attempt.studentId?.name || "N/A",
        attempt.quizId?.classId?.subject || "N/A",
        attempt.quizId?.lessonName || "N/A",
        attempt.marks,
        attempt.totalMarks,
        `${percentage}%`,
        new Date(attempt.attemptedAt).toLocaleString(),
      ];
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: "grid",
      headStyles: { fillColor: [79, 70, 229] }, // Indigo color
      styles: { fontSize: 10, cellPadding: 3 },
    });

    doc.save("Quiz_Marks.pdf");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100">
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
                              className={`mt-[50px] py-2 px-4 md:px-6 bg-gray-100 border-b fixed top-0 w-full z-30 transition-all duration-300 ${
                                isSidebarCollapsed 
                                  ? "ml-[60px] w-[calc(100%-60px)]" 
                                  : "ml-[18%] w-[calc(100%-18%)] md:ml-[250px] md:w-[calc(100%-250px)]"
                              }`}
                            >
                              {/* Breadcrumbs */}
                          <div
                            className={`mt-[50px] py-2 px-4 md:px-6 bg-gray-100 border-b transition-all duration-300 z-30 fixed top-0 left-0 w-full ${
                              isSidebarCollapsed
                                ? "ml-[60px] w-[calc(100%-60px)]"
                                : "ml-[18%] w-[calc(100%-18%)] md:ml-[250px] md:w-[calc(100%-250px)]"
                            }`}
                          >
                            <Breadcrumbs aria-label="breadcrumb">
                              
                              {breadcrumbItems}
                            </Breadcrumbs>
                            </div></div>
                          
                            
                            <div className="mt-[90px] p-4 md:p-6 overflow-y-auto h-[calc(100vh-90px)]">
            <ErrorBoundary>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-5xl mx-auto space-y-8"
              >
                <h2 className="text-3xl font-extrabold text-center text-indigo-600 tracking-tight">
                  Report
                </h2>

                {error ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-600 bg-red-100 p-3 rounded-md text-center shadow-sm"
                  >
                    {error}
                  </motion.div>
                ) : loading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-indigo-600 font-semibold flex justify-center"
                  >
                    <svg
                      className="animate-spin h-8 w-8 text-indigo-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </motion.div>
                ) : (
                  <>
                    {/* Subscribed Students Section */}
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">
                          Subscribed Students
                        </h3>
                        <div className="flex space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowSubFilter(!showSubFilter)}
                            className="py-2 px-4 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 shadow-md"
                          >
                            {showSubFilter ? "Hide Filters" : "Show Filters"}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={generateSubPDF}
                            disabled={!filteredSubscriptions?.length}
                            className="py-2 px-4 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150 shadow-md disabled:opacity-50"
                          >
                            Export PDF
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={exportSubToXLSX}
                            className="py-2 px-4 rounded-lg text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-150 shadow-md"
                          >
                            Export XLSX
                          </motion.button>
                        </div>
                      </div>

                      {/* Subscribed Students Filters */}
                      <AnimatePresence>
                        {showSubFilter && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mb-4 p-4 bg-gray-50 rounded-lg shadow-inner"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div>
                                <input
                                  type="text"
                                  name="studentName"
                                  placeholder="Filter by Student Name"
                                  value={subFilters.studentName}
                                  onChange={handleSubFilterChange}
                                  className="h-10 w-full border rounded-lg shadow-sm px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                                />
                              </div>
                              <div>
                                <input
                                  type="text"
                                  name="class"
                                  placeholder="Filter by Class"
                                  value={subFilters.class}
                                  onChange={handleSubFilterChange}
                                  className="h-10 w-full border rounded-lg shadow-sm px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                                />
                              </div>
                              <div>
                                <select
                                  name="status"
                                  value={subFilters.status}
                                  onChange={handleSubFilterChange}
                                  className="h-10 w-full border rounded-lg shadow-sm px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                                >
                                  <option value="">Filter by Status</option>
                                  <option value="active">Active</option>
                                  <option value="inactive">Inactive</option>
                                </select>
                              </div>
                              <div>
                                <input
                                  type="date"
                                  name="paymentDateStart"
                                  value={subFilters.paymentDateStart}
                                  onChange={handleSubFilterChange}
                                  className="h-10 w-full border rounded-lg shadow-sm px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                                />
                              </div>
                              <div>
                                <input
                                  type="date"
                                  name="paymentDateEnd"
                                  value={subFilters.paymentDateEnd}
                                  onChange={handleSubFilterChange}
                                  className="h-10 w-full border rounded-lg shadow-sm px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                                />
                              </div>
                            </div>
                            <div className="flex space-x-2 mt-4">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={applySubFilters}
                                className="py-2 px-4 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 shadow-md"
                              >
                                Apply Filters
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={resetSubFilters}
                                className="py-2 px-4 rounded-lg text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 shadow-md"
                              >
                                Reset Filters
                              </motion.button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {filteredSubscriptions.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-indigo-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-900 uppercase tracking-wider">
                                  Student Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-900 uppercase tracking-wider">
                                  Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-900 uppercase tracking-wider">
                                  Class
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-900 uppercase tracking-wider">
                                  Fee Paid
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-900 uppercase tracking-wider">
                                  Payment Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-900 uppercase tracking-wider">
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {filteredSubscriptions.map((sub, index) => (
                                <motion.tr
                                  key={sub._id}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.3, delay: index * 0.05 }}
                                  className="hover:bg-gray-50 transition duration-150"
                                >
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {sub.userId?.name || "N/A"}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {sub.userId?.email || "N/A"}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {sub.classId?.subject || "N/A"}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {sub.feePaid}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {new Date(sub.createdAt).toLocaleDateString()}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {sub.status}
                                  </td>
                                </motion.tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-gray-600 text-center text-sm mt-4">
                          No students subscribed to your classes.
                        </p>
                      )}
                    </div>

                    <hr className="border-gray-200 my-6" />

                    {/* Quiz Marks Section */}
                    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">
                          Quiz Marks (Top Scores First)
                        </h3>
                        <div className="flex space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowQuizFilter(!showQuizFilter)}
                            className="py-2 px-4 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 shadow-md"
                          >
                            {showQuizFilter ? "Hide Filters" : "Show Filters"}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={generateQuizPDF}
                            disabled={!filteredQuizAttempts?.length}
                            className="py-2 px-4 rounded-lg text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-150 shadow-md disabled:opacity-50"
                          >
                            Export PDF
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={exportQuizToXLSX}
                            className="py-2 px-4 rounded-lg text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-150 shadow-md"
                          >
                            Export XLSX
                          </motion.button>
                        </div>
                      </div>

                      {/* Quiz Marks Filters */}
                      <AnimatePresence>
                        {showQuizFilter && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mb-4 p-4 bg-gray-50 rounded-lg shadow-inner"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              <div>
                                <input
                                  type="text"
                                  name="studentName"
                                  placeholder="Filter by Student Name"
                                  value={quizFilters.studentName}
                                  onChange={handleQuizFilterChange}
                                  className="h-10 w-full border rounded-lg shadow-sm px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                                />
                              </div>
                              <div>
                                <input
                                  type="text"
                                  name="class"
                                  placeholder="Filter by Class"
                                  value={quizFilters.class}
                                  onChange={handleQuizFilterChange}
                                  className="h-10 w-full border rounded-lg shadow-sm px-3 py-2 text-sm text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                                />
                              </div>
                              <div>
                                <input
                                  type="text"
                                  name="quizTitle"
                                  placeholder="Filter by Quiz Title"
                                  value={quizFilters.quizTitle}
                                  onChange={handleQuizFilterChange}
                                  className="h-10 w-full border rounded-lg shadow-sm px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                                />
                              </div>
                              <div>
                                <input
                                  type="number"
                                  name="percentageMin"
                                  placeholder="Min Percentage"
                                  value={quizFilters.percentageMin}
                                  onChange={handleQuizFilterChange}
                                  className="h-10 w-full border rounded-lg shadow-sm px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                                />
                              </div>
                              <div>
                                <input
                                  type="number"
                                  name="percentageMax"
                                  placeholder="Max Percentage"
                                  value={quizFilters.percentageMax}
                                  onChange={handleQuizFilterChange}
                                  className="h-10 w-full border rounded-lg shadow-sm px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
                                />
                              </div>
                            </div>
                            <div className="flex space-x-2 mt-4">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={applyQuizFilters}
                                className="py-2 px-4 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 shadow-md"
                              >
                                Apply Filters
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={resetQuizFilters}
                                className="py-2 px-4 rounded-lg text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition duration-150 shadow-md"
                              >
                                Reset Filters
                              </motion.button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {filteredQuizAttempts.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-indigo-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-900 uppercase tracking-wider">
                                  Student Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-900 uppercase tracking-wider">
                                  Class
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-900 uppercase tracking-wider">
                                  Quiz Title
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-900 uppercase tracking-wider">
                                  Marks
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-900 uppercase tracking-wider">
                                  Total Marks
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-900 uppercase tracking-wider">
                                  Percentage
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-indigo-900 uppercase tracking-wider">
                                  Attempted At
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {filteredQuizAttempts.map((attempt, index) => (
                                <motion.tr
                                  key={attempt._id}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.3, delay: index * 0.05 }}
                                  className="hover:bg-gray-50 transition duration-150"
                                >
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {attempt.studentId?.name || "N/A"}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {attempt.quizId?.classId?.subject || "N/A"}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {attempt.quizId?.lessonName || "N/A"}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {attempt.marks}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {attempt.totalMarks}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {((attempt.marks / attempt.totalMarks) * 100).toFixed(2)}%
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {new Date(attempt.attemptedAt).toLocaleString()}
                                  </td>
                                </motion.tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-gray-600 text-center text-sm mt-4">
                          No quiz attempts available.
                        </p>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;