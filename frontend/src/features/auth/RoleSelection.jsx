import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import logo from "../../assets/educonnetlogo.png";
import Footer from "../../../src/features/home/Footer";
import { AcademicCapIcon, BuildingLibraryIcon } from "@heroicons/react/24/outline";

const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState("");
  const navigate = useNavigate();

  const handleNext = () => {
    if (selectedRole === "teacher") {
      navigate("/register/teacher");
    } else if (selectedRole === "institute") {
      navigate("/register/institute");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
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

      {/* Main Content */}
      <div className="pt-32 pb-20 px-6 lg:px-16 flex min-h-[calc(100vh-200px)]">
        <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row">
          {/* Left Section: Student Option */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-1/3 flex flex-col justify-center items-center text-center mb-12 lg:mb-0"
          >
            <p className="text-gray-600 text-lg mb-6">
              Are you looking to join a class as a student?
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/register/student")}
              className="bg-blue-200 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-blue-300 transition-all"
            >
              Join as Student
            </motion.button>
          </motion.div>

          {/* Right Section: Role Selection */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:w-2/3 flex flex-col justify-center items-center"
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
                Join EduConnect As
              </h1>
              <p className="text-gray-600 text-lg">
                Select your role to continue registration
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-2xl w-full mx-auto">
              {/* Teacher Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-8 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedRole === "teacher"
                    ? "border-blue-300 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
                onClick={() => setSelectedRole("teacher")}
              >
                <AcademicCapIcon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Educator</h3>
                <p className="text-gray-600">
                  Join as a teacher, instructor, or individual educator
                </p>
              </motion.div>

              {/* Institute Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-8 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedRole === "institute"
                    ? "border-blue-300 bg-blue-50"
                    : "border-gray-200 hover:border-blue-300"
                }`}
                onClick={() => setSelectedRole("institute")}
              >
                <BuildingLibraryIcon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Institution</h3>
                <p className="text-gray-600">
                  Register your school, college, or educational organization
                </p>
              </motion.div>
            </div>

            {/* Continue Registration Button */}
            <motion.div
              className="text-center mt-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: selectedRole ? 1 : 0.5 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                disabled={!selectedRole}
                className={`w-full max-w-xs px-4 py-4 rounded-xl font-semibold transition-all ${
                  selectedRole
                    ? "bg-blue-400 text-white shadow-lg hover:bg-blue-500 hover:shadow-blue-400/30"
                    : "bg-red-200 text-black-300 cursor-not-allowed"
                }`}
              >
                Continue Registration
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RoleSelection;