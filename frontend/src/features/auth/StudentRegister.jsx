// frontend/src/features/auth/StudentRegister.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const StudentRegister = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    contactNumber: "",
    dateOfBirth: "",
    guardianName: "",
    guardianContactNumber: "",
    addressLine1: "",
    addressLine2: "",
    district: "",
    zipCode: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateStep1 = () => {
    const tempErrors = {};
    if (!formData.firstName) tempErrors.firstName = "First name is required";
    if (!formData.lastName) tempErrors.lastName = "Last name is required";
    if (!formData.contactNumber) tempErrors.contactNumber = "Contact number is required";
    if (!formData.dateOfBirth) tempErrors.dateOfBirth = "Date of birth is required";
    if (!formData.guardianName) tempErrors.guardianName = "Guardian name is required";
    if (!formData.guardianContactNumber) tempErrors.guardianContactNumber = "Guardian contact number is required";
    if (!formData.addressLine1) tempErrors.addressLine1 = "Address Line 1 is required";
    if (!formData.district) tempErrors.district = "District is required";
    if (!formData.zipCode) tempErrors.zipCode = "Zip Code is required";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const validateStep2 = () => {
    const tempErrors = {};
    if (!formData.email) tempErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) tempErrors.email = "Invalid email format";
    if (!formData.username) tempErrors.username = "Username is required";
    if (!formData.password) tempErrors.password = "Password is required";
    else if (formData.password.length < 6) tempErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) tempErrors.confirmPassword = "Passwords do not match";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
      setErrors({});
    }
  };

  const handleBackStep = () => {
    setStep(1);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;
    setIsLoading(true);
    setNotification({ message: "", type: "" });

    try {
      const { data } = await axios.post("http://localhost:5000/api/auth/register", {
        ...formData,
        role: "student",
      });
      localStorage.setItem("userInfo", JSON.stringify(data));
      setNotification({ message: "Registration successful! Redirecting to login...", type: "success" });
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      console.error("Registration error:", error);
      setNotification({
        message: `Registration Failed: ${error.response?.data?.message || "Please try again"}`,
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
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-gray-100 font-sans p-4">
      {/* Notification */}
      <AnimatePresence>
        {notification.message && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 0.9, x: 16 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`fixed top-4 right-0 px-4 py-2 rounded-l-md shadow-lg text-white text-xs font-medium z-50 ${
              notification.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form Container */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-xl bg-white p-6 rounded-2xl shadow-xl space-y-4 h-[85vh] flex flex-col justify-between"
      >
        {/* Header */}
        <div className="space-y-1">
          <button
            onClick={handleBack}
            className="flex items-center text-indigo-600 hover:text-indigo-800 transition duration-150"
          >
            <span className="text-xs font-medium">← Back</span>
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-indigo-600 tracking-tight">EduConnect</h1>
            <h2 className="mt-1 text-lg font-semibold text-gray-800">Student Registration</h2>
            <p className="text-xs text-gray-500">Step {step} of 2</p>
          </div>
        </div>

        {/* Form */}
        <form
          className="flex-1 flex flex-col justify-between space-y-4"
          onSubmit={step === 1 ? handleNext : handleSubmit}
          noValidate
        >
          <div className="space-y-4">
            {step === 1 && (
              <>
                {/* Student Details Section */}
                <div>
                  <h3 className="text-base font-semibold text-gray-800 mb-2">Student Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* First Name */}
                    <div>
                      <input
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`h-10 w-full border rounded-lg shadow-sm px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ${
                          errors.firstName ? "border-red-500" : "border-gray-200"
                        }`}
                        placeholder="First Name"
                      />
                      {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                    </div>

                    {/* Contact Number */}
                    <div>
                      <input
                        name="contactNumber"
                        type="tel"
                        value={formData.contactNumber}
                        onChange={handleChange}
                        className={`h-10 w-full border rounded-lg shadow-sm px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ${
                          errors.contactNumber ? "border-red-500" : "border-gray-200"
                        }`}
                        placeholder="Contact Number"
                      />
                      {errors.contactNumber && (
                        <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>
                      )}
                    </div>

                    {/* Last Name */}
                    <div>
                      <input
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={`h-10 w-full border rounded-lg shadow-sm px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ${
                          errors.lastName ? "border-red-500" : "border-gray-200"
                        }`}
                        placeholder="Last Name"
                      />
                      {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <input
                        name="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className={`h-10 w-full border rounded-lg shadow-sm px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ${
                          errors.dateOfBirth ? "border-red-500" : "border-gray-200"
                        }`}
                      />
                      {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
                    </div>
                  </div>
                </div>

                {/* Guardian Details Section */}
                <div>
                  <h3 className="text-base font-semibold text-gray-800 mb-2">Guardian Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Address Line 1 */}
                    <div>
                      <input
                        name="addressLine1"
                        type="text"
                        value={formData.addressLine1}
                        onChange={handleChange}
                        className={`h-10 w-full border rounded-lg shadow-sm px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ${
                          errors.addressLine1 ? "border-red-500" : "border-gray-200"
                        }`}
                        placeholder="Address Line 1"
                      />
                      {errors.addressLine1 && (
                        <p className="text-red-500 text-xs mt-1">{errors.addressLine1}</p>
                      )}
                    </div>

                    {/* Guardian Name */}
                    <div>
                      <input
                        name="guardianName"
                        type="text"
                        value={formData.guardianName}
                        onChange={handleChange}
                        className={`h-10 w-full border rounded-lg shadow-sm px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ${
                          errors.guardianName ? "border-red-500" : "border-gray-200"
                        }`}
                        placeholder="Guardian Name"
                      />
                      {errors.guardianName && <p className="text-red-500 text-xs mt-1">{errors.guardianName}</p>}
                    </div>

                    {/* Address Line 2 */}
                    <div>
                      <input
                        name="addressLine2"
                        type="text"
                        value={formData.addressLine2}
                        onChange={handleChange}
                        className="h-10 w-full border rounded-lg shadow-sm px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 border-gray-200"
                        placeholder="Address Line 2"
                      />
                    </div>

                    {/* Guardian Contact Number */}
                    <div>
                      <input
                        name="guardianContactNumber"
                        type="tel"
                        value={formData.guardianContactNumber}
                        onChange={handleChange}
                        className={`h-10 w-full border rounded-lg shadow-sm px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ${
                          errors.guardianContactNumber ? "border-red-500" : "border-gray-200"
                        }`}
                        placeholder="Guardian Contact Number"
                      />
                      {errors.guardianContactNumber && (
                        <p className="text-red-500 text-xs mt-1">{errors.guardianContactNumber}</p>
                      )}
                    </div>

                    {/* District */}
                    <div>
                      <input
                        name="district"
                        type="text"
                        value={formData.district}
                        onChange={handleChange}
                        className={`h-10 w-full border rounded-lg shadow-sm px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ${
                          errors.district ? "border-red-500" : "border-gray-200"
                        }`}
                        placeholder="District"
                      />
                      {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
                    </div>

                    {/* Zip Code */}
                    <div>
                      <input
                        name="zipCode"
                        type="text"
                        value={formData.zipCode}
                        onChange={handleChange}
                        className={`h-10 w-full border rounded-lg shadow-sm px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ${
                          errors.zipCode ? "border-red-500" : "border-gray-200"
                        }`}
                        placeholder="Zip Code"
                      />
                      {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
                    </div>
                  </div>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                {/* Account Details Section */}
                <div>
                  <h3 className="text-base font-semibold text-gray-800 mb-2">Account Details</h3>
                  <div className="space-y-3">
                    {/* Email */}
                    <div>
                      <input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`h-10 w-full border rounded-lg shadow-sm px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ${
                          errors.email ? "border-red-500" : "border-gray-200"
                        }`}
                        placeholder="Email"
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    {/* Username */}
                    <div>
                      <input
                        name="username"
                        type="text"
                        value={formData.username}
                        onChange={handleChange}
                        className={`h-10 w-full border rounded-lg shadow-sm px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ${
                          errors.username ? "border-red-500" : "border-gray-200"
                        }`}
                        placeholder="Username"
                      />
                      {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                    </div>

                    {/* Password */}
                    <div className="relative">
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        className={`h-10 w-full border rounded-lg shadow-sm px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ${
                          errors.password ? "border-red-500" : "border-gray-200"
                        }`}
                        placeholder="Password"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                      {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>

                    {/* Confirm Password */}
                    <div className="relative">
                      <input
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`h-10 w-full border rounded-lg shadow-sm px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ${
                          errors.confirmPassword ? "border-red-500" : "border-gray-200"
                        }`}
                        placeholder="Confirm Password"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Navigation Buttons */}
          {step === 1 ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full py-2 px-4 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 shadow-md"
            >
              Next
            </motion.button>
          ) : (
            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handleBackStep}
                className="w-1/2 py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 shadow-md"
              >
                Back
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={isLoading}
                className={`w-1/2 py-2 px-4 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 shadow-md ${
                  isLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Registering...
                  </span>
                ) : (
                  "Register"
                )}
              </motion.button>
            </div>
          )}
        </form>

        {/* Link to Login */}
        <div className="text-center">
          <p className="text-xs text-gray-600">
            Already have an account?{" "}
            <a href="/login" className="text-indigo-600 hover:underline font-medium">
              Login
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentRegister;