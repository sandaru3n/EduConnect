// backend/routes/authRoutes.js

const express = require("express");
const { register, login, updateProfile, getProfile,requestPasswordReset,verifyResetCode,resetPassword,createNotice,
    getTeacherNotices,
    updateNotice,
    deleteNotice,
    getStudentNotices,
    markNoticeAsRead,
    getNoticeById,
    createAdminNotice,
    getAdminNotices,
    updateAdminNotice,
    deleteAdminNotice,
    getAdminNoticesForUser,
    markAdminNoticeAsRead,
    TeacherInstitutegetNoticeById,
    addTeacher,getRecentUsers,
    getTeachersByInstitute} = require("../controllers/authController");
    const {getTeacherQuizAttempts} = require("../controllers/quizController");
const { getSubscribedStudents } = require("../controllers/teacherReportController");


const { 
    submitSupportTicket,getSupportCategories,getSupportSubcategories,getAllSupportSubcategories,createSupportCategory,
    createSupportSubcategory,deleteSupportCategory,deleteSupportSubcategory,getAllSupportTickets, getSupportTicketById,
    updateSupportTicketStatus, deleteSupportTicket, getUserSupportTickets, getUserSupportTicketById, sendMessage,submitFeeWaiver,
    getFeeWaiverRequests,
    updateFeeWaiverStatus,
    getFeeWaiverHistory,
    getStudentClasses, getFeeWaiverRequestsForTeacher
} = require("../controllers/supportController");
const router = express.Router();

const { getAdminDashboardMetrics } = require("../controllers/dashboardController"); // New import

const { getTeacherSubscriptionHistory, getTeacherPaymentHistory } = require("../controllers/TeacherSubscriptionController"); // New import

const { getReceiptDetails,subscribeToClass,subscribeToStudyPack} = require('../controllers/paymentController');
const {getPaymentHistory} = require('../controllers/stusubscriptionController')

const authMiddleware = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");


// Configure multer for profile picture uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "src/public/uploads/profiles");
    },
    filename: (req, file, cb) => {
        cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPG and PNG files are allowed'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});


// Configure multer for fee waiver document uploads
const documentStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "../src/public/uploads/documents");
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const filename = `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`;
        cb(null, filename);
    }
});

const documentFileFilter = (req, file, cb) => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only PDF, JPEG, and PNG files are allowed"), false);
    }
};

const documentUpload = multer({
    storage: documentStorage,
    fileFilter: documentFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post("/register", register);
router.post("/login", login);
router.put("/profile", authMiddleware, upload.fields([{ name: 'profilePicture', maxCount: 1 }]), updateProfile);
router.get("/profile", authMiddleware, getProfile);


// Forgot Password Routes
router.post("/forgot-password", requestPasswordReset);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);


// Notice Routes
router.post("/notices", authMiddleware, createNotice);
router.get("/notices/teacher", authMiddleware, getTeacherNotices);
router.put("/notices", authMiddleware, updateNotice);
router.delete("/notices/:noticeId", authMiddleware, deleteNotice);
router.get("/notices/student", authMiddleware, getStudentNotices);
router.post("/notices/:noticeId/read", authMiddleware, markNoticeAsRead);
router.get("/notices/:noticeId", authMiddleware, getNoticeById);
router.get("/teacher/quiz-attempts", authMiddleware, getTeacherQuizAttempts);

// Admin Notice Routes (using TeacherInstituteNotice model)
router.post("/admin/notices", authMiddleware, createAdminNotice);
router.get("/admin/notices", authMiddleware, getAdminNotices);
router.put("/admin/notices", authMiddleware, updateAdminNotice);
router.delete("/admin/notices/:noticeId", authMiddleware, deleteAdminNotice);
router.get("/admin/notices/user", authMiddleware, getAdminNoticesForUser);
router.post("/admin/notices/:noticeId/read", authMiddleware, markAdminNoticeAsRead);
router.get("/admin/notices/teacher-institute/:noticeId", authMiddleware, TeacherInstitutegetNoticeById);


// Teacher Report Routes
router.get("/teacher/subscribed-students", authMiddleware, getSubscribedStudents);


// Support Ticket Routes
router.post("/support/submit", authMiddleware, submitSupportTicket);
router.get("/support/categories", authMiddleware, getSupportCategories);
router.get("/support/subcategories/all", authMiddleware, getAllSupportSubcategories); // Moved before dynamic route
router.get("/support/subcategories/:categoryId", authMiddleware, getSupportSubcategories);

// Teacher/Institute Support Ticket Routes
router.get("/support/tickets", authMiddleware, getUserSupportTickets);
router.get("/support/ticket/:ticketId", authMiddleware, getUserSupportTicketById);
router.post("/support/ticket/:ticketId/message", authMiddleware, sendMessage);

// Admin Support Ticket Routes
router.post("/admin/support/category", authMiddleware, createSupportCategory);
router.post("/admin/support/subcategory", authMiddleware, createSupportSubcategory);
router.delete("/admin/support/category/:categoryId",deleteSupportCategory);
router.delete("/admin/support/subcategory/:subcategoryId",deleteSupportSubcategory);
router.get("/admin/support/tickets", authMiddleware, getAllSupportTickets);
router.get("/admin/support/ticket/:ticketId", authMiddleware, getSupportTicketById);
router.put("/admin/support/ticket/:ticketId/status", authMiddleware, updateSupportTicketStatus);
router.delete("/admin/support/ticket/:ticketId", authMiddleware, deleteSupportTicket);
router.post("/admin/support/ticket/:ticketId/message", authMiddleware, sendMessage);


// Fee Waiver Routes
router.post("/support/fee-waiver", authMiddleware, documentUpload.single("document"), submitFeeWaiver);
router.get("/teacher/fee-waiver-requests", authMiddleware, getFeeWaiverRequests);
router.put("/teacher/fee-waiver/:feeWaiverId/status", authMiddleware, updateFeeWaiverStatus);
router.get("/support/fee-waiver/history", authMiddleware, getFeeWaiverHistory); 
router.get("/support/student-classes", authMiddleware, getStudentClasses); // Add this route
router.get("/teacher/fee-waiver-requests", authMiddleware, getFeeWaiverRequestsForTeacher); // Add this route


// Dashboard routes
router.get("/dashboard/admin-metrics", getAdminDashboardMetrics); // Removed authMiddleware

//  routes
router.get("/dashboard/teacher-subscription-history", authMiddleware, getTeacherSubscriptionHistory);
router.get("/dashboard/teacher-payment-history", authMiddleware, getTeacherPaymentHistory);

// Payment routes
router.post("/subscriptions/class", authMiddleware, subscribeToClass);
router.post("/subscriptions/study-pack", authMiddleware, subscribeToStudyPack);
router.get("/subscriptions/payment-history", authMiddleware, getPaymentHistory);
router.get("/subscriptions/receipt/:subscriptionId", authMiddleware, getReceiptDetails);


router.post('/add-teacher', authMiddleware, addTeacher);
router.get('/teachers', authMiddleware, getTeachersByInstitute);



// Admin Recent Users Route
router.get("/admin/recent-users", authMiddleware,getRecentUsers);

module.exports = router;
