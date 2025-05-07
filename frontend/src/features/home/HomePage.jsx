import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useSpring, useTransform, useMotionValue } from 'framer-motion';

import FAQSection from "./FAQ"
// Import assets (update paths as needed)
import logo from './assets/educonnetlogo.png';
import logowhite from './assets/educonnetlogowhite.png';
import heroBg from './assets/Homepage02.jpg';
import studentImg from './assets/student.jpg';
import feature1 from './assets/learning.png';
import feature2 from './assets/stats.png';
import feature3 from './assets/verified.png';


import testimonial1 from './assets/testimonial1.jpg';
import testimonial2 from './assets/testimonial2.jpg';
import testimonial3 from './assets/testimonial3.jpg';



const Footer = () => {
  
  const footerLinks = [
    {
      title: "Information",
      links: [
        { text: "Pricing", url: "/pricing" },
        { text: "Knowledgebase", url: "/knowledgebase" },
        { text: "Contact Us", url: "/contact" },
        { text: "Privacy Policy", url: "/privacy-policy" },
        { text: "Terms of Service", url: "/terms-of-service" },
      ],
    },
  ];

  
  

  return (
    <footer className="bg-black text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <img src={logowhite} alt="EduConnect" className="h-10" />
              <span className="text-xl font-bold text-white"></span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Transforming education through innovative technology and collaborative learning experiences.
            </p>
            <div className="flex gap-3">
  {['twitter', 'facebook', 'linkedin', 'instagram'].map((platform) => (
    <a
      key={platform}
      href="#"
      className="p-2 bg-gray-800 rounded-lg hover:bg-primary transition-all"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        {platform === 'twitter' && (
          <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
        )}
        {platform === 'facebook' && (
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        )}
        {platform === 'linkedin' && (
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        )}
        {platform === 'instagram' && (
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        )}
      </svg>
    </a>
  ))}
</div>
          </div>

          {/* Information Links */}
          <div className="grid grid-cols-2 gap-6">
            {footerLinks.map((section, index) => (
              <div key={index} className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-3">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        to={link.url}
                        className="text-gray-400 text-sm hover:text-primary transition-colors"
                      >
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-800 rounded-lg">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Email</p>
                  <p className="text-white text-sm">support@educonnect.com</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-800 rounded-lg">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Phone</p>
                  <p className="text-white text-sm">+94 75 365 8574</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-800 rounded-lg">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Address</p>
                  <p className="text-white text-sm">123 Education Street, Colombo 05</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-6 text-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} EduConnect. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

const HomePage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const moveX = clientX - window.innerWidth / 2;
    const moveY = clientY - window.innerHeight / 2;
    x.set(moveX / 15);
    y.set(moveY / 15);
  };

  const features = [
    { icon: feature1, title: "Interactive Learning", desc: "Engage with immersive class materials" },
    { icon: feature2, title: "Progress Tracking", desc: "Monitor your learning journey" },
    { icon: feature3, title: "Certification", desc: "Earn recognized credentials" },
  ];

  const testimonials = [
    { img: testimonial1, name: "Sarah Johnson", role: "Student" },
    { img: testimonial2, name: "Michael Chen", role: "Teacher" },
    { img: testimonial3, name: "Emma Wilson", role: "Parent" },
  ];
  const navigate = useNavigate();

  return (
    
    <div className="relative overflow-x-hidden" onMouseMove={handleMouseMove}>
      {/* Progress Bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-2 bg-accent/30 z-50" style={{ scaleX }} />

      {/* Floating Background Elements */}
      <motion.div 
        className="fixed -top-64 -left-64 w-[800px] h-[800px] bg-gradient-to-r from-primary to-accent rounded-full opacity-10 blur-3xl"
        style={{ x, y }}
      />
      <motion.div 
        className="fixed -bottom-64 -right-64 w-[800px] h-[800px] bg-gradient-to-r from-accent to-primary rounded-full opacity-10 blur-3xl"
        style={{ x: useTransform(x, (x) => -x), y: useTransform(y, (y) => -y) }}
      />

      {/* Navigation */}
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

          <button 
            className="lg:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="w-6 h-0.5 bg-gray-700 mb-1"></div>
            <div className="w-6 h-0.5 bg-gray-700 mb-1"></div>
            <div className="w-6 h-0.5 bg-gray-700"></div>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden mt-4 p-4 bg-white rounded-lg shadow-xl"
          >
            {['Home', 'Pricing', 'About', 'Contact', 'Login'].map((item) => (
              <Link 
                key={item} 
                to={`/${item.toLowerCase()}`}
                className="block py-2 text-gray-700 hover:text-primary"
              >
                {item}
              </Link>
            ))}
          </motion.div>
        )}
      </motion.nav>

      {/* Hero Section */}
      <section className="min-h-screen bg-blue-100 pt-32 pb-20 px-6 lg:px-16 flex items-center">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-800 leading-tight mb-6">
              Transform Your 
              <span className="text-primary"> Learning</span> 
              Experience
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Join thousands of students and educators in our interactive learning ecosystem.
            </p>
            <div className="flex gap-4">
            <motion.button 
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg shadow-lg 
            hover:bg-green-700 hover:shadow-green-600/30 transition-all
            focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2
            active:bg-green-700 duration-300"
>
  Start Learning
</motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                className="border-2 border-primary text-primary px-8 py-4 rounded-full text-lg hover:bg-primary/10"
              >
                Take a Tour
              </motion.button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <img 
              src={heroBg} 
              alt="Students learning" 
              className="rounded-3xl shadow-2xl" 
            />
            <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-lg">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-4 rounded-xl">
                  <span className="text-3xl font-bold text-primary">95%</span>
                </div>
                <div>
                  <p className="text-gray-600">Success Rate</p>
                  <p className="font-semibold">Across All Classes</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-16">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Why Choose EduConnect?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover the features that make our platform the best choice for modern education
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.2 }}
                className="bg-purple-100 p-8 rounded-3xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="bg-primary/10 p-4 rounded-xl w-max mb-6">
                  <img src={feature.icon} alt={feature.title} className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Class Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <img 
                src={studentImg} 
                alt="Interactive learning" 
                className="rounded-3xl shadow-2xl" 
              />
              <div className="absolute -right-8 top-1/2 bg-white p-6 rounded-2xl shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="bg-accent/10 p-4 rounded-xl">
                    <span className="text-3xl font-bold text-accent">1M+</span>
                  </div>
                  <div>
                    <p className="text-gray-600">Active</p>
                    <p className="font-semibold">Learners</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-4xl font-bold text-gray-800 mb-6">
                Interactive Learning Experience
              </h2>
              <p className="text-gray-600 mb-8">
                Engage with dynamic class materials, real-time collaboration tools, and 
                AI-powered learning assistants. Our platform adapts to your learning style 
                for maximum effectiveness.
              </p>
              <div className="space-y-6">
                {['Personalized Learning Paths', 'Gamified Achievements', '24/7 Support'].map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                        <span className="text-white">{index + 1}</span>
                      </div>
                    </div>
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-16">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              What Our Users Say
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hear from our global community of learners and educators
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.2 }}
                className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-4 mb-6">
                  <img 
                    src={testimonial.img} 
                    alt={testimonial.name} 
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  "EduConnect transformed how I approach teaching. The analytics tools helped me
                  understand student needs better than ever before."
                </p>
                <div className="mt-4 flex gap-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section>
      <FAQSection/>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-6 lg:px-16 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-12 shadow-2xl"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Ready to Transform Your Education?
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of learners already experiencing the future of education
            </p>
            <div className="flex justify-center gap-4">
            <motion.button 
  whileHover={{ 
    scale: 1.05,
    boxShadow: "0 4px 14px rgba(246, 130, 31, 0.35)"
  }}
  whileTap={{ scale: 0.98 }}
  className="bg-[#F6821F] text-white px-8 py-4 rounded-full text-lg font-semibold
            shadow-lg hover:bg-[#F56B00] hover:shadow-[#F6821F]/30 transition-all
            duration-300 focus:outline-none focus:ring-2 focus:ring-[#F6821F]
            focus:ring-offset-2 active:bg-[#E55F00]"
>
  Start Free Trial
</motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                className="border-2 border-primary text-primary px-8 py-4 rounded-full text-lg hover:bg-primary/10"
              >
                Schedule Demo
              </motion.button>
            </div>
          </motion.div>
        </div>
        
      </section>
      <Footer />
    </div>
  );
};

export default HomePage;