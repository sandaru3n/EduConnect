import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import logo from "./assets/educonnetlogo.png";
import Footer from "./Footer";

const PageView = () => {
  const location = useLocation();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPage();
  }, [location.pathname]);

  const fetchPage = async () => {
    try {
      const slug = location.pathname.substring(1);
      const response = await fetch(`http://localhost:5000/api/pages/${slug}`);
      if (!response.ok) throw new Error("Page not found");
      const data = await response.json();
      setPage(data);
    } catch (error) {
      console.error("Error fetching page:", error);
      setPage(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 120 }}
        className="fixed w-full py-4 px-6 lg:px-16 bg-white/80 backdrop-blur-md z-40 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <motion.div whileHover={{ scale: 1.25 }}>
            <img src={logo} alt="EduConnect" className="h-14" />
          </motion.div>

          <div className="hidden lg:flex items-center gap-8">
            {[
              { name: 'Home', path: '/' },
              { name: 'Pricing', path: '/pricing' },
              { name: 'About', path: '/about-us' },
              { name: 'Contact', path: '/contact' },
              { name: 'Login', path: '/login' }
            ].map((item) => (
              <motion.div key={item.name} whileHover={{ scale: 1.05 }}>
                <Link 
                  to={item.path} 
                  className="text-gray-700 hover:text-primary font-medium transition-colors"
                >
                  {item.name}
                </Link>
              </motion.div>
            ))}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              className="bg-blue-600 text-white px-6 py-2 rounded-full shadow-lg 
                        hover:shadow-blue-600/30 transition-all
                        active:bg-blue-700 focus:outline-none focus:ring-2 
                        focus:ring-blue-600 focus:ring-offset-2"
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="pt-32 pb-20 px-6 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8"
        >
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : page ? (
            <>
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-4xl lg:text-5xl font-bold text-gray-800 mb-8"
              >
                {page.title}
              </motion.h1>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="prose lg:prose-lg max-w-none text-gray-600"
                dangerouslySetInnerHTML={{ __html: page.content }}
              />
            </>
          ) : (
            <div className="text-center py-20">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Page Not Found</h2>
              <p className="text-gray-600 mb-8">The requested page could not be found.</p>
              <button
                onClick={() => navigate('/')}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
              >
                Return to Home
              </button>
            </div>
          )}
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default PageView;