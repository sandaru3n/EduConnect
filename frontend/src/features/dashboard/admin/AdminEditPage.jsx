// frontend/src/features/dashboard/admin/AdminEditPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Link, useLocation } from "react-router-dom";
import AdminSidebar from "../../../components/AdminSidebar/index";
import AdminHeader from "../../../components/AdminHeader/index";
import { Editor } from "@tinymce/tinymce-react";
import { AnimatePresence, motion } from "framer-motion"; // Add Framer Motion imports

const AdminEditPage = () => {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { slug } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: "", type: "" }); // Add notification state

  useEffect(() => {
    fetchPage();
  }, [slug]);

  const fetchPage = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/pages/${slug}`);
      const data = await response.json();
      setPage(data);
    } catch (error) {
      console.error("Error fetching page:", error);
      setNotification({ message: "Failed to fetch page. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/pages/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(page),
      });
      if (!response.ok) {
        throw new Error("Failed to update page");
      }
      setNotification({ message: "Page updated successfully!", type: "success" });
      setTimeout(() => {
        navigate("/admin/pages");
      }, 1500); // Navigate after 1.5 seconds to allow the user to see the notification
    } catch (error) {
      console.error("Error updating page:", error);
      setNotification({ message: "Failed to update page. Please try again.", type: "error" });
    }
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  useEffect(() => {
    const handleResize = () => {
      const mobileView = window.innerWidth <= 768;
      setIsMobile(mobileView);
      setIsSidebarCollapsed(mobileView);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const pathnames = location.pathname.split("/").filter((x) => x);
  const breadcrumbItems = [
    <Link key="/admin" to="/admin" className="text-blue-600 hover:underline">
      Admin
    </Link>,
    <Link key="/admin/pages" to="/admin/pages" className="text-blue-600 hover:underline">
      Pages
    </Link>,
    <span key={slug} className="text-gray-800">
      {slug.charAt(0).toUpperCase() + slug.slice(1)}
    </span>,
  ];

  const pageTitle = pathnames.length > 0
    ? pathnames[pathnames.length - 1].charAt(0).toUpperCase() + pathnames[pathnames.length - 1].slice(1)
    : "Dashboard";

  useEffect(() => {
    document.title = `${pageTitle} - Admin Panel`;
  }, [location, pageTitle]);

  const handleEditorChange = (content) => {
    setPage({ ...page, content });
  };

  // Get TinyMCE API key from environment variable
  const tinymceApiKey = import.meta.env.VITE_TINYMCE_API_KEY || "no-api-key";
  console.log("TinyMCE API Key:", tinymceApiKey); // Debug the key

  return (
    <div>
      <AdminHeader
        isSidebarCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        isMobile={isMobile}
      />
      <div className="flex min-h-screen">
        <div
          className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 ${
            isSidebarCollapsed ? "w-[60px]" : "w-[18%] md:w-[250px]"
          }`}
        >
          <AdminSidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
        </div>

        <div
          className={`flex-1 transition-all duration-300 ${
            isSidebarCollapsed ? "ml-[60px]" : "ml-[18%] md:ml-[250px]"
          }`}
        >
          {/* Notification - Floating from Right */}
          <AnimatePresence>
            {notification.message && (
              <motion.div
                initial={{ opacity: 0, x: "100%" }} // Start off-screen to the right
                animate={{ opacity: 0.9, x: 16 }} // Slide in to 16px from the right edge
                exit={{ opacity: 0, x: "100%" }} // Slide back out to the right
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={`fixed top-6 right-0 px-24 py-3 rounded-l-md shadow-md text-white text-sm font-medium z-50 ${
                  notification.type === "success" ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {notification.message}
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className={`mt-[50px] py-2 px-4 md:px-6 bg-gray-100 border-b fixed top-0 w-full z-30 transition-all duration-300 ${
              isSidebarCollapsed
                ? "ml-[60px] w-[calc(100%-60px)]"
                : "ml-[18%] w-[calc(100%-18%)] md:ml-[250px] md:w-[calc(100%-250px)]"
            }`}
          >
            <nav className="text-sm">
              {breadcrumbItems.map((item, index) => (
                <span key={index}>
                  {item}
                  {index < breadcrumbItems.length - 1 && " / "}
                </span>
              ))}
            </nav>
          </div>

          <div className="mt-[90px] p-4 md:p-6 overflow-y-auto h-[calc(100vh-90px)]">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="max-w-3xl mx-auto py-4"
            >
              {loading ? (
                <div className="text-center text-gray-600">Loading...</div>
              ) : (
                <div className="bg-white shadow-lg rounded-lg p-6">
                  <h1 className="text-2xl font-bold text-gray-800 mb-4">Edit {page.title}</h1>
                  <div className="mb-6">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      id="title"
                      type="text"
                      className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                      value={page.title}
                      onChange={(e) => setPage({ ...page, title: e.target.value })}
                    />
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content
                    </label>
                    {tinymceApiKey === "no-api-key" ? (
                      <div className="text-red-600 mb-2">
                        No valid TinyMCE API key found. Please add it to your .env file as VITE_TINYMCE_API_KEY.
                      </div>
                    ) : null}
                    <Editor
                      apiKey={tinymceApiKey}
                      value={page.content}
                      onEditorChange={handleEditorChange}
                      init={{
                        height: 400,
                        menubar: true,
                        plugins: [
                          "advlist autolink lists link image charmap print preview anchor",
                          "searchreplace visualblocks code fullscreen",
                          "insertdatetime media table paste code help wordcount",
                        ],
                        toolbar:
                          "undo redo | formatselect | bold italic underline | \
                          alignleft aligncenter alignright alignjustify | \
                          bullist numlist outdent indent | link image | code | removeformat | help",
                        content_style:
                          "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                      }}
                    />
                  </div>
                  <button
                    onClick={handleUpdate}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEditPage;