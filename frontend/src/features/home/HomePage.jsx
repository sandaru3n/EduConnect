import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useSpring, useTransform, useMotionValue } from 'framer-motion';

// Import assets (update paths as needed)
import logo from './assets/educonnetlogo.png';
import heroBg from './assets/Homepage02.jpg';
import studentImg from './assets/student.jpg';
import feature1 from './assets/program01.jpg';
import feature2 from './assets/program02.jpg';
import feature3 from './assets/program03.jpg';


import testimonial1 from './assets/testimonial1.jpg';
import testimonial2 from './assets/testimonial2.jpg';
import testimonial3 from './assets/testimonial3.jpg';

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
    { icon: feature1, title: "Interactive Learning", desc: "Engage with immersive course materials" },
    { icon: feature2, title: "Progress Tracking", desc: "Monitor your learning journey" },
    { icon: feature3, title: "Certification", desc: "Earn recognized credentials" },
  ];

  const testimonials = [
    { img: testimonial1, name: "Sarah Johnson", role: "Student" },
    { img: testimonial2, name: "Michael Chen", role: "Teacher" },
    { img: testimonial3, name: "Emma Wilson", role: "Parent" },
  ];

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
          <motion.div whileHover={{ scale: 1.05 }}>
            <img src={logo} alt="EduConnect" className="h-12" />
          </motion.div>

          <div className="hidden lg:flex items-center gap-8">
            {['Home', 'Courses', 'About', 'Contact', 'Login'].map((item) => (
              <motion.div key={item} whileHover={{ scale: 1.05 }}>
                <Link to={`/${item.toLowerCase()}`} className="text-gray-700 hover:text-primary font-medium transition-colors">
                  {item}
                </Link>
              </motion.div>
            ))}
            <motion.button 
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
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
            {['Home', 'Courses', 'About', 'Contact', 'Login'].map((item) => (
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
      <section className="min-h-screen pt-32 pb-20 px-6 lg:px-16 flex items-center">
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
  className="bg-green-600 text-white px-8 py-4 rounded-full text-lg shadow-lg 
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
                  <p className="font-semibold">Across All Courses</p>
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
                className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-shadow"
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

      {/* Interactive Courses Section */}
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
                Engage with dynamic course materials, real-time collaboration tools, and 
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
                whileHover={{ scale: 1.05 }}
                className="bg-primary text-white px-8 py-4 rounded-full text-lg shadow-lg hover:shadow-primary/30"
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
    </div>
  );
};

export default HomePage;