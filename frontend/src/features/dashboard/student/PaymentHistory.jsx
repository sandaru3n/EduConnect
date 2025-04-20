//frontend/src/features/dashboard/student/PaymentHistory.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  TextField,
  Grid,
  Button
} from "@mui/material";

import StudentSidebar from "../../../components/StudentSidebar/index";
import StudentHeader from "../../../components/StudentHeader/index";

const PaymentHistoryDash = () => {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [filters, setFilters] = useState({
    className: "",
    teacherName: "",
    paymentDate: ""
  });

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get("http://localhost:5000/api/subscriptions/payment-history", config);
        setPayments(data);
        setFilteredPayments(data);
      } catch (error) {
        console.error("Error fetching payment history:", error);
      }
    };

    const handleResize = () => {
      const mobileView = window.innerWidth <= 768;
      setIsMobile(mobileView);
      setIsSidebarCollapsed(mobileView);
    };

    fetchPaymentHistory();
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...payments];

    if (filters.className) {
      filtered = filtered.filter(payment => 
        payment.classId.subject.toLowerCase().includes(filters.className.toLowerCase())
      );
    }

    if (filters.teacherName) {
      filtered = filtered.filter(payment => 
        payment.classId.teacherId.name.toLowerCase().includes(filters.teacherName.toLowerCase())
      );
    }

    if (filters.paymentDate) {
      filtered = filtered.filter(payment => 
        new Date(payment.createdAt).toLocaleDateString() === new Date(filters.paymentDate).toLocaleDateString()
      );
    }

    setFilteredPayments(filtered);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      className: "",
      teacherName: "",
      paymentDate: ""
    });
    setFilteredPayments(payments);
  };

  const pathnames = location.pathname.split("/").filter((x) => x);
  const breadcrumbItems = pathnames.map((value, index) => {
    const last = index === pathnames.length - 1;
    const to = `/${pathnames.slice(0, index + 1).join("/")}`;
    const displayName = value.charAt(0).toUpperCase() + value.slice(1);

    return last ? (
      <Typography key={to} color="text.primary">{displayName}</Typography>
    ) : (
      <MuiLink key={to} component={Link} to={to} underline="hover" color="inherit">
        {displayName}
      </MuiLink>
    );
  });

  const pageTitle = pathnames.length > 0 
    ? pathnames[pathnames.length - 1].charAt(0).toUpperCase() + pathnames[pathnames.length - 1].slice(1)
    : "Dashboard";

  useEffect(() => {
    document.title = `${pageTitle} - Student Dashboard - EduConnect`;
  }, [pageTitle]);

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
          
          <div className="p-6 mt-[80px] bg-white rounded-lg shadow-md">
            <Typography variant="h5" gutterBottom className="font-bold text-gray-900">
              Payment History
            </Typography>

            {/* Filter Section */}
            <Grid container spacing={2} className="mb-6">
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Class Name"
                  name="className"
                  value={filters.className}
                  onChange={handleFilterChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Teacher Name"
                  name="teacherName"
                  value={filters.teacherName}
                  onChange={handleFilterChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Payment Date"
                  name="paymentDate"
                  type="date"
                  value={filters.paymentDate}
                  onChange={handleFilterChange}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <div className="flex gap-2 justify-end">
                  <Button 
                    variant="contained" 
                    onClick={applyFilters}
                    className="w-[100px]"
                  >
                    Filter
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={clearFilters}
                    className="w-[100px]"
                  >
                    Clear
                  </Button>
                </div>
              </Grid>
            </Grid>

            {filteredPayments.length === 0 ? (
              <Typography className="text-gray-500 text-center py-6">No payment history found.</Typography>
            ) : (
              <TableContainer component={Paper} className="mt-4">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell className="font-semibold">Class Name</TableCell>
                      <TableCell className="font-semibold">Teacher</TableCell>
                      <TableCell className="font-semibold">Fee Paid</TableCell>
                      <TableCell className="font-semibold">Payment Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment._id} className="hover:bg-gray-50">
                        <TableCell>{payment.classId.subject}</TableCell>
                        <TableCell>{payment.classId.teacherId.name}</TableCell>
                        <TableCell>${payment.feePaid}</TableCell>
                        <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistoryDash;