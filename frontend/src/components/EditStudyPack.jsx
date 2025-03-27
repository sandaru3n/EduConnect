import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBackIos';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Import your custom background image (place it in the src/assets folder)
import backgroundImage from '../../assets/background.jpg'; // Replace with your image path

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Login - EduConnect";
  }, []);

  const handleLogin = async () => {
    try {
      const response = await api.post('/api/login', { email, password });
      localStorage.setItem('token', response.data.token); // Save token to localStorage
      console.log('Token saved:', response.data.token); // Debugging: Verify token
      console.log('Navigating to /study-packs...'); // Debugging: Verify navigation
      navigate('/study-packs'); // Redirect to study packs page
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

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
    setNotification({ message: "", type: "" });

    try {
        const { data } = await axios.post("http://localhost:5000/api/auth/login", { email, password });
        localStorage.setItem("userInfo", JSON.stringify(data));
        if (stayLoggedIn) {
            localStorage.setItem("stayLoggedIn", "true");
        }
        setNotification({ message: "You're Successfully Logged In", type: "success" });
        setTimeout(() => {
            const roleRoutes = {
                admin: "/admin/dashboard",
                teacher: "/teacher/dashboard",
                student: "/student/dashboard",
                institute: "/institute/dashboard",
            };
            navigate(roleRoutes[data.role] || "/");
        }, 1500);
    } catch (error) {
        console.error("Login error:", error);
        setNotification({
            message: `Login Failed: ${error.response?.data?.message || "Please check your credentials"}`,
            type: "error",
        });
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
    <div className="min-h-screen flex justify-center items-center font-sans bg-[#f5f7fa] p-4">
      {/* Floating notification */}
      <AnimatePresence>
        {notification.message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`fixed top-6 left-1/2 transform -translate-x-1/2 py-3 px-6 rounded-full shadow-lg z-50 flex items-center space-x-2 ${
              notification.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircleOutlineIcon className="h-5 w-5" />
            ) : (
              <ErrorOutlineIcon className="h-5 w-5" />
            )}
            <span className="font-medium text-sm">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back button */}
      <button
        onClick={handleBack}
        className="fixed top-6 left-6 flex items-center text-[#5469d4] hover:text-[#7b8ce6] transition-all duration-200 bg-white py-2 px-4 rounded-full shadow-sm"
      >
        <ArrowBackIcon className="h-4 w-4 mr-1" />
        <span className="text-sm font-medium">Home</span>
      </button>

      {/* Main container */}
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl shadow-xl flex bg-white">
        {/* Left side - Image with overlay */}
        <div className="lg:w-1/2 relative hidden lg:block">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${backgroundImage})`,
            }}
          ></div>
          <div className="absolute inset-0 bg-[#5469d4] opacity-90"></div>

          <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-12 z-10">
            <div className="w-24 h-24 mb-8 rounded-full bg-white/20 flex items-center justify-center">
              <motion.div
                animate={{ rotateY: 360 }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                className="text-3xl font-bold"
              >
                EC
              </motion.div>
            </div>

            <motion.h1
              className="text-4xl font-bold mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              EduConnect
            </motion.h1>
            <motion.p
              className="text-lg text-center text-white/80 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Your gateway to limitless learning possibilities
            </motion.p>

            <div className="space-y-6 w-full max-w-sm">
              <motion.div
                className="bg-white/10 backdrop-blur-sm p-4 rounded-xl"
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <h3 className="font-medium mb-2">Personalized Learning</h3>
                <p className="text-sm text-white/70">Tailor your educational journey with adaptive learning paths</p>
              </motion.div>

              <motion.div
                className="bg-white/10 backdrop-blur-sm p-4 rounded-xl"
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <h3 className="font-medium mb-2">Expert Instructors</h3>
                <p className="text-sm text-white/70">Learn from industry professionals with proven experience</p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="w-full lg:w-1/2 p-6 sm:p-8 md:p-12">
          <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-[#2d3748] mb-2">Welcome back</h1>
              <p className="text-[#718096]">Please enter your credentials to access your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Email field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#4a5568] mb-1">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EmailIcon className="h-5 w-5 text-[#a0aec0]" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-3 py-3 border-2 rounded-lg outline-none transition-colors ${
                      errors.email
                        ? "border-red-300 text-red-800 bg-red-50"
                        : "border-[#e2e8f0] hover:border-[#cbd5e0] focus:border-[#5469d4] text-[#2d3748]"
                    }`}
                    placeholder="you@example.com"
                  />
                </div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-1 text-sm text-red-600 flex items-center"
                    >
                      <ErrorOutlineIcon className="h-4 w-4 mr-1" />
                      {errors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Password field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-[#4a5568]">
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-xs font-medium text-[#5469d4] hover:text-[#7b8ce6] transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <LockIcon className="h-5 w-5 text-[#a0aec0]" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-10 py-3 border-2 rounded-lg outline-none transition-colors ${
                      errors.password
                        ? "border-red-300 text-red-800 bg-red-50"
                        : "border-[#e2e8f0] hover:border-[#cbd5e0] focus:border-[#5469d4] text-[#2d3748]"
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <VisibilityOff className="h-5 w-5 text-[#a0aec0] hover:text-[#5469d4] transition-colors" />
                    ) : (
                      <Visibility className="h-5 w-5 text-[#a0aec0] hover:text-[#5469d4] transition-colors" />
                    )}
                  </button>
                </div>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-1 text-sm text-red-600 flex items-center"
                    >
                      <ErrorOutlineIcon className="h-4 w-4 mr-1" />
                      {errors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Remember me checkbox */}
              <div className="flex items-center">
                <div className="relative h-5 w-5">
                  <input
                    id="stay-logged-in"
                    type="checkbox"
                    checked={stayLoggedIn}
                    onChange={(e) => setStayLoggedIn(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`h-5 w-5 rounded border-2 transition-colors duration-200 flex items-center justify-center ${
                      stayLoggedIn ? 'bg-[#5469d4] border-[#5469d4]' : 'border-[#cbd5e0] bg-white'
                    }`}
                    onClick={() => setStayLoggedIn(!stayLoggedIn)}
                  >
                    {stayLoggedIn && (
                      <motion.svg
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="h-3 w-3 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </motion.svg>
                    )}
                  </div>
                </div>
                <label
                  htmlFor="stay-logged-in"
                  className="ml-2 text-sm text-[#4a5568] cursor-pointer select-none"
                  onClick={() => setStayLoggedIn(!stayLoggedIn)}
                >
                  Stay logged in
                </label>
              </div>

              {/* Login button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center py-3 px-4 rounded-lg font-medium text-white transition-all ${
                  isLoading
                    ? "bg-[#7b8ce6] cursor-not-allowed"
                    : "bg-[#5469d4] hover:bg-[#4054b2] shadow-md hover:shadow-lg"
                }`}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-2"
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
                  </>
                ) : (
                  "Sign in"
                )}
              </motion.button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#e2e8f0]"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-white text-sm text-[#718096]">Or continue with</span>
                </div>
              </div>

              {/* Social login buttons */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className="flex justify-center items-center py-2.5 px-4 border-2 border-[#e2e8f0] rounded-lg hover:bg-[#f7fafc] transition-colors"
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  className="flex justify-center items-center py-2.5 px-4 border-2 border-[#e2e8f0] rounded-lg hover:bg-[#f7fafc] transition-colors"
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="#0078d7">
                    <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z" />
                  </svg>
                  Microsoft
                </button>
              </div>

              {/* Sign up link */}
              <div className="text-center">
                <p className="text-sm text-[#718096]">
                  Don't have an account?{" "}
                  <a href="/register/student" className="font-medium text-[#5469d4] hover:text-[#7b8ce6] transition-colors">
                    Create an account
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
