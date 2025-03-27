import StudentSidebar from "../../../components/StudentSidebar/index";
import StudentHeader from "../../../components/StudentHeader/index";
import { Breadcrumbs, Link as MuiLink, Typography } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from 'axios';
import { Card, CardContent, CardMedia, Button, Grid, CircularProgress, Alert } from '@mui/material';
import PaymentModal from '../../../components/PaymentModal';
import { FaVideo, FaFilePdf, FaLink } from 'react-icons/fa';

const StudyPacks = () => {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [studyPacks, setStudyPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedStudyPackId, setSelectedStudyPackId] = useState(null);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

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
    const fetchStudyPacks = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };
        const { data } = await axios.get('http://localhost:5000/api/studypacks', config);
        setStudyPacks(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch study packs');
        setLoading(false);
      }
    };
    fetchStudyPacks();
  }, []);

  const handlePay = (studyPackId) => {
    setSelectedStudyPackId(studyPackId);
    setPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (paymentData) => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.post('http://localhost:5000/api/payments/subscribe-studypack', {
        studyPackId: paymentData.classId,
        cardNumber: paymentData.cardNumber,
        expiryDate: paymentData.expiryDate,
        cvv: paymentData.cvv,
      }, config);
      alert('Purchase successful!');
      setPaymentModalOpen(false);
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Payment failed');
    }
  };

  const pathnames = location.pathname.split("/").filter((x) => x);
  const breadcrumbItems = pathnames.map((value, index) => {
    const last = index === pathnames.length - 1;
    const to = `/${pathnames.slice(0, index + 1).join("/")}`;
    const displayName = value.charAt(0).toUpperCase() + value.slice(1);

    return last ? (
      <Typography key={to} className="font-semibold text-gray-900">
        {displayName}
      </Typography>
    ) : (
      <MuiLink
        key={to}
        component={Link}
        to={to}
        className="text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
      >
        {displayName}
      </MuiLink>
    );
  });

  const pageTitle = pathnames.length > 0 
    ? pathnames[pathnames.length - 1].charAt(0).toUpperCase() + pathnames[pathnames.length - 1].slice(1)
    : "Dashboard";

  useEffect(() => {
    document.title = `${pageTitle} - Student Dashboard - EduConnect`;
  }, [location, pageTitle]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <CircularProgress className="text-indigo-600" />
    </div>
  );

  if (error) return (
    <div className="max-w-4xl mx-auto p-6">
      <Alert severity="error" className="rounded-lg shadow-md">{error}</Alert>
    </div>
  );

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col font-sans antialiased">
      <StudentHeader 
        isSidebarCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        isMobile={isMobile}
        className="sticky top-0 z-50 bg-white shadow-lg border-b border-gray-200"
      />
      
      <div className="flex flex-1">
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
            isSidebarCollapsed ? "ml-16" : "ml-64 md:ml-72"
          } p-4 md:p-8`}
        >
          <div className="bg-white p-6 rounded-xl shadow-md mb-8 mt-16 border border-gray-200 sticky top-0 z-30">
            <Breadcrumbs aria-label="breadcrumb" className="text-sm md:text-base text-gray-600">
              <MuiLink
                component={Link}
                to="/student"
                className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors duration-200"
              >
                Student
              </MuiLink>
              {breadcrumbItems}
            </Breadcrumbs>
          </div>

          <div className="max-w-6xl mx-auto">
            <Typography variant="h4" className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
              Available Study Packs
            </Typography>
            <Grid container spacing={4}>
              {studyPacks.map(pack => (
                <Grid item xs={12} sm={6} md={4} key={pack._id}>
                  <Card className="h-full flex flex-col bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <CardMedia
                      component="img"
                      height="160"
                      image={pack.coverPhotoUrl}
                      alt={pack.title}
                      className="object-cover h-40 w-full"
                    />
                    <CardContent className="flex-1 p-5 flex flex-col">
                      <Typography variant="h6" className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                        {pack.title}
                      </Typography>
                      <div className="space-y-2 text-gray-600">
                        <Typography variant="body2" className="text-sm">
                          <span className="font-medium">Subject:</span> {pack.subject}
                        </Typography>
                        <Typography variant="body2" className="text-sm">
                          <span className="font-medium">Price:</span> <span className="text-green-600 font-semibold">${pack.price}</span>
                        </Typography>
                        <Typography variant="body2" className="text-sm flex items-center">
                          <FaVideo className="mr-2 text-indigo-600" /> 
                          <span className="font-medium">Videos:</span> {pack.fileCount.videos}
                        </Typography>
                        <Typography variant="body2" className="text-sm flex items-center">
                          <FaFilePdf className="mr-2 text-red-600" /> 
                          <span className="font-medium">PDFs:</span> {pack.fileCount.pdfs}
                        </Typography>
                        <Typography variant="body2" className="text-sm flex items-center">
                          <FaLink className="mr-2 text-blue-600" /> 
                          <span className="font-medium">URLs:</span> {pack.fileCount.urls}
                        </Typography>
                      </div>
                      <Button
                        variant="contained"
                        onClick={() => handlePay(pack._id)}
                        className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-lg transition-colors duration-200"
                      >
                        Purchase Now
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </div>
          <PaymentModal
            open={paymentModalOpen}
            onClose={() => setPaymentModalOpen(false)}
            onSubmit={handlePaymentSubmit}
            classId={selectedStudyPackId}
          />
        </main>
      </div>
    </div>
  );
};

export default StudyPacks;