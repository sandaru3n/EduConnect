import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, BookOpenIcon, LifebuoyIcon } from '@heroicons/react/24/outline';
import logo from './assets/educonnetlogo.png';
import Footer from './Footer';

const Knowledgebase = () => {
  const [articles, setArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/knowledgebase');
        setArticles(data);
      } catch (error) {
        console.error('Error fetching knowledgebase articles:', error);
      }
    };
    fetchArticles();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.get(`http://localhost:5000/api/knowledgebase/search?query=${searchQuery}`);
      setArticles(data);
    } catch (error) {
      console.error('Error searching articles:', error);
    }
  };

  const categories = [...new Set(articles.map(article => article.category))].map(category => ({
    name: category,
    count: articles.filter(article => article.category === category).length,
    description: {
      'Set Up Your Account': 'Configure your account settings and initial setup guides',
      'Work With Your Team': 'Collaboration tools and team management resources',
      'Explore Proactive Messages': 'Automation and communication best practices',
      'Self Service Best Practices': 'Empower users with self-help resources'
    }[category] || 'Explore related articles and guides'
  }));

  return (
    <div className="min-h-screen bg-blue-50">
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
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-800 mb-6">
              How can we help you today?
            </h1>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
              <div className="relative">
                <MagnifyingGlassIcon className="w-6 h-6 absolute left-4 top-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search knowledge base..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Search
                </button>
              </div>
            </form>
          </motion.div>

          {/* Categories Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {categories.map((category, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <BookOpenIcon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    {category.name}
                  </h3>
                </div>
                <p className="text-gray-600 mb-4">{category.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {category.count} articles
                  </span>
                  <button
                    onClick={() => navigate(`/knowledgebase/${category.name}`)}
                    className="text-primary hover:text-primary-dark font-medium"
                  >
                    Explore →
                  </button>
                </div>
              </motion.div>
            ))}
            
            {/* Support Card */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-blue-500 p-6 rounded-xl text-white"
            >
              <div className="flex flex-col  h-full justify-between">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-white/20 rounded-lg">
                      <LifebuoyIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold">Need Help?</h3>
                  </div>
                  <p className="text-white/90 mb-6">
                    Can't find what you're looking for? Our support team is ready to help.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/contact')}
                  className="w-full bg-black text-primary py-2 px-4 rounded-lg font-medium hover:bg-yellow-400 transition-colors"
                >
                  Contact Support
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Knowledgebase;