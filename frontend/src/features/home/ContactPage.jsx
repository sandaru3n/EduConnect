import { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import logo from './assets/educonnetlogo.png';
import Footer from './Footer';
import contactIllustration from './assets/contactimg.jpg'; // Add your image
import { EnvelopeIcon, PhoneIcon, MapPinIcon, PaperAirplaneIcon, 
  ChatBubbleLeftRightIcon, UserCircleIcon, ChatBubbleLeftEllipsisIcon,
  CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/contact/submit', formData);
      setSuccess('Message sent successfully!');
      setFormData({ name: '', email: '', message: '' });
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
      setSuccess(null);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
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

      {/* Contact Content */}
      <div className="pt-32 pb-20 px-6 lg:px-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="inline-block mb-6"
            >
              <span className="bg-primary/10 text-primary px-6 py-2 rounded-full text-sm font-semibold flex items-center justify-center w-max mx-auto">
                
              </span>
              <ChatBubbleLeftRightIcon className="w-20 h-20 mr-2" />
            </motion.div>
            <h1 className="text-3xl lg:text-6xl font-bold text-gray-800 mb-6">
            Get in Touch
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Whether you have questions, suggestions, or just want to say hello - our team is ready to help!
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Contact Section */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block relative overflow-hidden"
            >
              <div className="bg-gradient-to-br from-primary to-blue-600 p-2 rounded-3xl shadow-xl h-full">
                <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-2xl p-2 h-full">
                  <div className="space-y-8 text-blue">
                    <div className="flex items-center gap-4 p-2 bg-white/10 rounded-xl">
                      <div className="p-3 bg-white/20 rounded-lg">
                        <EnvelopeIcon className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">Email Support</p>
                        <p className="text-sm opacity-90">support@educonnect.com</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-2 bg-white/10 rounded-xl">
                      <div className="p-3 bg-white/20 rounded-lg">
                        <PhoneIcon className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">Phone Support</p>
                        <p className="text-sm opacity-90">+94 75 365 8574</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-2 bg-white/10 rounded-xl">
                      <div className="p-3 bg-white/20 rounded-lg">
                        <MapPinIcon className="w-8 h-8" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">Address</p>
                        <p className="text-sm opacity-90">123 Education Street, Colombo 05</p>
                      </div>
                    </div>

                    <div className="mt-8 relative rounded-2xl overflow-hidden">
                      <img 
                        src={contactIllustration} 
                        alt="Contact Illustration" 
                        className="w-full h-64 object-cover rounded-xl opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
              </div>
            </motion.div>

            {/* Enhanced Contact Form */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden"
            >
              <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
              
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 text-green-700 p-4 rounded-xl mb-6 flex items-center gap-3"
                >
                  <CheckCircleIcon className="w-5 h-5" />
                  {success}
                </motion.div>
              )}
              
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 text-red-700 p-4 rounded-xl mb-6 flex items-center gap-3"
                >
                  <ExclamationTriangleIcon className="w-5 h-5" />
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                    <UserCircleIcon className="w-5 h-5 text-primary" />
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder-gray-400 bg-white text-gray-900w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder-gray-400"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                    <EnvelopeIcon className="w-5 h-5 text-primary" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder-gray-400 bg-white text-gray-900w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder-gray-400"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                    <ChatBubbleLeftEllipsisIcon className="w-5 h-5 text-primary" />
                    Your Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder-gray-400 bg-white text-gray-900w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder-gray-400"
                    placeholder="How can we help you today?"
                    required
                  ></textarea>
                </div>

                <motion.button
  whileHover={{ 
    scale: 1.00,
    background: "linear-gradient(to right, #34D399, #059669)" // from-green-400 to-green-700
  }}
  whileTap={{ scale: 0.95 }}
  type="submit"
  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
>
  <PaperAirplaneIcon className="w-5 h-5" />
  Send Message
</motion.button>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default ContactPage;