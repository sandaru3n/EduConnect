import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBackIos';

// Import your custom background image (place it in the src/assets folder)
import backgroundImage from '../../assets/background.jpg'; // Replace with your image path

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" }); // New state for notifications
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Login - EduConnect";
  }, []);

  const validate = () => {
    const tempErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) tempErrors.email = "Email is required";
    else if (!emailRegex.test(email)) tempErrors.email = "Invalid email format";
    if (!password) tempErrors.password = "Password is required";
    else if (password.length < 6) tempErrors.password = "Password must be at least 6 characters";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setNotification({ message: "", type: "" }); // Clear previous notifications

    try {
      const { data } = await axios.post("http://localhost:5000/api/auth/login", { email, password });
      localStorage.setItem("userInfo", JSON.stringify(data));
      if (stayLoggedIn) {
        localStorage.setItem("stayLoggedIn", "true");
      }
      setNotification({ message: "Login Successfully", type: "success" }); // Show success notification
      setTimeout(() => {
        const roleRoutes = {
          admin: "/admin/dashboard",
          teacher: "/teacher/dashboard",
          student: "/student/dashboard",
          institute: "/institute/dashboard",
        };
        navigate(roleRoutes[data.role] || "/");
      }, 1500); // Navigate after 1.5 seconds to allow the user to see the success message
    } catch (error) {
      console.error("Login error:", error);
      setNotification({ message: `Error: ${error.response?.data?.message || "Please check your credentials"}`, type: "error" }); // Show error notification
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleBack = () => {
    navigate("/"); // Navigate to the homepage
  };

  return (
    <div className="min-h-screen flex font-sans relative">
      {/* Left Side - Background Image */}
      <div
        className="hidden lg:block w-3/4 bg-cover bg-center"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      ></div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-100 p-8">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="self-start mb-4 flex items-center text-indigo-600 hover:text-indigo-800 transition duration-150 bg-gray-100 border-none outline-none"
        >
          <ArrowBackIcon className="h-5 w-5 mr-1" />
          <span className="text-sm font-medium">BACK</span>
        </button>
        {/* Notification */}
        <AnimatePresence>
            {notification.message && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`absolute top-0 left-0 right-0 mx-auto w-fit px-4 py-2 rounded-md shadow-md text-white text-sm font-medium ${
                  notification.type === "success" ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {notification.message}
              </motion.div>
            )}
          </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-sm w-full space-y-6 relative"
        >
          

          {/* Logo/Title */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-indigo-600">EduConnect</h1>
            <h2 className="mt-2 text-xl font-semibold text-gray-900">Log in</h2>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="relative">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EmailIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`h-12 w-full border rounded-md shadow-sm pl-10 pr-4 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Email"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="relative">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`h-12 w-full border rounded-md shadow-sm pl-10 pr-12 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Password"
                />
                <div
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <VisibilityOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Visibility className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </div>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Stay Logged In Checkbox */}
            <div className="flex items-center">
              <input
                id="stay-logged-in"
                type="checkbox"
                checked={stayLoggedIn}
                onChange={(e) => setStayLoggedIn(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="stay-logged-in" className="ml-2 text-sm text-gray-600">
                Stay logged in
              </label>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 ${
                isLoading ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Log in"
              )}
            </motion.button>

            {/* Links */}
            <div className="text-center space-y-2">
              <a href="#" className="block text-sm text-indigo-600 hover:underline">
                I forgot my password
              </a>
              <p className="text-sm text-gray-600">
                Don’t have an account?{" "}
                <a href="/register" className="text-indigo-600 hover:underline">
                  Sign up
                </a>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;