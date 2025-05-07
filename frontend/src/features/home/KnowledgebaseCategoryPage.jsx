import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import logo from "./assets/educonnetlogo.png"; // Replace with your actual logo
import Footer from "./Footer";
import { ChevronLeftIcon, BookOpenIcon } from "@heroicons/react/24/outline";

const KnowledgebaseCategoryPage = () => {
  const { category } = useParams(); // Get the category from the URL
  const [articles, setArticles] = useState([]);
  const [expandedArticle, setExpandedArticle] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/knowledgebase/category/${category}`);
        setArticles(data);
      } catch (error) {
        console.error("Error fetching articles for category:", error);
      }
    };
    fetchArticles();
  }, [category]);

  const toggleArticle = (id) => {
    setExpandedArticle(expandedArticle === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="fixed top-0 left-0 w-full flex items-center justify-between px-6 py-4 z-50 transition-all duration-500 bg-white/80 backdrop-blur-md shadow-sm"
      >
        <motion.div whileHover={{ scale: 1.25 }}>
          <img src={logo} alt="EduConnect" className="h-14" />
        </motion.div>

        <div className="hidden lg:flex items-center gap-8">
          {[
            { name: "Home", path: "/" },
            { name: "Pricing", path: "/pricing" },
            { name: "About", path: "/about-us" },
            { name: "Contact", path: "/contact" },
            { name: "Login", path: "/login" },
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
            onClick={() => navigate("/register")}
            className="bg-blue-600 text-white px-6 py-2 rounded-full shadow-lg hover:shadow-blue-600/30 transition-all active:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
          >
            Get Started
          </motion.button>
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="pt-32 pb-20 px-6 lg:px-16">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center gap-4 mb-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/knowledgebase")}
                className="flex items-center text-primary hover:text-primary-dark"
              >
                <ChevronLeftIcon className="w-6 h-6 mr-2" />
                Back to Knowledgebase
              </motion.button>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
              {category}
            </h1>
            <p className="text-gray-600 text-lg">
              Explore helpful articles and guides in the {category} category to get the most out of EduConnect.
            </p>
          </motion.div>

          {/* Articles List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {articles.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-gray-600"
              >
                No articles found in this category.
              </motion.div>
            ) : (
              articles.map((article, index) => (
                <motion.div
                  key={article._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
                >
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleArticle(article._id)}
                  >
                    <div className="flex items-center gap-4">
                      <BookOpenIcon className="w-6 h-6 text-primary" />
                      <h2 className="text-xl font-semibold text-gray-900">{article.title}</h2>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedArticle === article._id ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <svg
                        className="w-6 h-6 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </motion.div>
                  </div>
                  {expandedArticle === article._id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 text-gray-600 leading-relaxed"
                    >
                      <p>{article.content}</p>
                      <p className="text-sm text-gray-500 mt-4">
                        Last updated: {new Date(article.updatedAt).toLocaleDateString()}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default KnowledgebaseCategoryPage;