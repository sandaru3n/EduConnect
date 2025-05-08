import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { fetchSubscriptions } from "/src/services/api"; // Import the API call
import logo from "./assets/educonnetlogo.png"; // Replace with your actual logo
import Footer from "./Footer"; // Import your Footer component

// Heroicons for solid color icons
import {
  UsersIcon,
  UserGroupIcon,
  CloudIcon,
  LifebuoyIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";

const PricingPage = () => {
  const [plans, setPlans] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const data = await fetchSubscriptions();
      const activePlans = data.filter((plan) => plan.status === "Active");
      setPlans(activePlans);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      // Fallback to demo plans if the API fails (optional)
      const demoPlans = [
        {
          _id: "1",
          plan: "Starter",
          price: "0",
          studentLimit: "100",
          teacherAccounts: "5",
          storage: "5GB Storage",
          support: "Basic Support",
          recommended: false,
        },
        {
          _id: "2",
          plan: "Professional",
          price: "29",
          studentLimit: "500",
          teacherAccounts: "20",
          storage: "20GB Storage",
          support: "Priority Support",
          recommended: true,
        },
        {
          _id: "3",
          plan: "Enterprise",
          price: "99",
          studentLimit: "Unlimited",
          teacherAccounts: "Unlimited",
          storage: "100GB Storage",
          support: "24/7 Support",
          recommended: false,
        },
      ];
      setPlans(demoPlans);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 40, duration: 0.3 }} // Adjusted stiffness and damping for faster animation
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

      {/* Pricing Content */}
      <div className="pt-24 pb-20 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block mb-6"
            >
              
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl lg:text-6xl font-bold text-gray-800 mb-6"
            >
              Simple, Transparent Pricing
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-600 text-lg max-w-2xl mx-auto"
            >
              Start for free, then upgrade when you're ready. Cancel anytime.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan._id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -10 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                className="relative bg-white rounded-2xl p-8 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {plan.recommended && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center shadow-md">
                    <span className="mr-2">⭐</span> Most Popular
                  </div>
                )}

                <div className="mb-8">
                  <h3
                    className={`text-2xl font-bold mb-4 ${
                      plan.recommended ? "text-primary" : "text-gray-900"
                    }`}
                  >
                    {plan.plan}
                  </h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      ${parseFloat(plan.price).toFixed(2)}
                    </span>
                    <span className="text-gray-500 ml-2 text-lg">/month</span>
                  </div>
                  <div className="h-px bg-gray-200 mb-8"></div>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <UsersIcon className="w-6 h-6 text-primary mr-3" />
                      <span className="text-gray-700">{plan.studentLimit} Students</span>
                    </div>
                    <div className="flex items-center">
                      <UserGroupIcon className="w-6 h-6 text-primary mr-3" />
                      <span className="text-gray-700">{plan.teacherAccounts} Teachers</span>
                    </div>
                    <div className="flex items-center">
                      <CloudIcon className="w-6 h-6 text-primary mr-3" />
                      <span className="text-gray-700">{plan.storage}</span>
                    </div>
                    <div className="flex items-center">
                      <LifebuoyIcon className="w-6 h-6 text-primary mr-3" />
                      <span className="text-gray-700">{plan.support}</span>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/register')}
                  className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 ${
                    plan.recommended
                      ? "bg-primary text-white hover:bg-primary-dark shadow-md hover:shadow-lg"
                      : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                  }`}
                >
                  Get Started
                </motion.button>
              </motion.div>
            ))}
          </div>

          {/* Trust Badges */}
          <motion.div
            className="mt-20 text-center flex flex-wrap justify-center gap-8 opacity-75"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center">
              <CheckCircleIcon className="w-6 h-6 text-green-500 mr-2" />
              <span className="text-gray-600">30-day money back guarantee</span>
            </div>
            <div className="flex items-center">
              <CheckCircleIcon className="w-6 h-6 text-green-500 mr-2" />
              <span className="text-gray-600">Secure SSL encryption</span>
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PricingPage;