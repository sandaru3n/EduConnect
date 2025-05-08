//frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./features/home/HomePage";
import PricingPage from "./features/home/PricingPage";
import ContactPage from "./features/home/ContactPage";
import AdminDashboard from "./features/dashboard/admin/AdminDashboard";
import Subscription from "./features/dashboard/admin/Subscription";
import TeacherDashboard from "./features/dashboard/teacher/TeacherDashboard";
import StudentDashboard from "./features/dashboard/student/StudentDashboard";
import InstituteDashboard from "./features/dashboard/institute/InstituteDashboard";
import Login from "./features/auth/Login";
//import Register from "./features/auth/Register";
import ProtectedRoute from "./routes/ProtectedRoute";


import StudentRegister from "./features/auth/StudentRegister";
import TeacherRegister from "./features/auth/TeacherRegister";
import InstituteRegister from "./features/auth/InstituteRegister";

import PageView from "./features/home/PageView";
import AdminPages from "./features/dashboard/admin/AdminPages";
import AdminEditPage from "./features/dashboard/admin/AdminEditPage";
import EditProfile from "./features/dashboard/admin/AdminEditProfile";
import StudentEditProfile from "./features/dashboard/student/StudentEditProfile";
import ManageLibrary from "./features/dashboard/admin/EBookUpload";


import StudentLibrary from "./features/dashboard/student/eLibrary";
import TeacherLibrary from "./features/dashboard/teacher/eLibrary";
import PaymentForm from "./features/dashboard/student/PaymentForm";
import MyClasses from "./features/dashboard/student/MyClasses";
 
import TeacherCreateClass  from "./features/dashboard/teacher/CreateClass";
import TeacherViewAllClass from "./features/dashboard/teacher/ViewAllClasses";
import TeacherUpdateClass from "./features/dashboard/teacher/UpdateClass";
import UploadMaterials from "./features/dashboard/teacher/UploadMaterial";
import ClassMaterial from "./features/dashboard/student/ClassMaterials";
import AvailableClasses from "./features/dashboard/student/AvailableClasses";
import PaymentHistory from "./features/dashboard/student/PaymentHistory";
import RefundManagement from "./features/dashboard/admin/RefundManagement";
import RefundRequest from "./features/dashboard/student/RefundRequest";
import RefundHistory from "./features/dashboard/student/RefundHistory";

import RoleSelection from "./features/auth/RoleSelection";

import ActiveTeachers from "./features/dashboard/student/ActiveTeachers";


// frontend/src/App.jsx (example)
import UploadStudyPack from "./features/dashboard/teacher/UploadStudyPack";
import StudyPacks from './features/dashboard/student/StudyPacks';
import PurchasedStudyPacks from './features/dashboard/student/PurchasedStudyPacks';
import ManageStudyPacks from './features/dashboard/teacher/ManageStudyPacks';

import StudentMessage from "./features/dashboard/student/StudentMessage";
import TeacherMessage from "./features/dashboard/teacher/TeacherMessage";

import ManageFAQs from "./features/dashboard/admin/ManageFAQs";


import Knowledgebase from "../src/features/home/Knowledgebase";

import ManageKnowledgebase from "./features/dashboard/admin/ManageKnowledgebase";
import KnowledgebaseCategoryPage from "./features/home/KnowledgebaseCategoryPage";
import ContactMessages from "./features/dashboard/admin/ContactMessages";

import ManageExtensionRequests from "./features/dashboard/teacher/ManageExtensionRequests";

import QuizGenerator from "./features/dashboard/teacher/QuizGenerator";
import StudentQuiz from "./features/dashboard/student/StudentQuiz";
import StudentQuizList from "./features/dashboard/student/StudentQuizList";

import DoubtResolver from "./features/dashboard/student/DoubtResolver"

import StudentNotices from "./features/dashboard/student/StudentNotices";
import TeacherNotices from "./features/dashboard/teacher/TeacherNotices";

import AdminNotices from "./features/dashboard/admin/AdminNotices";
import TeacherNoticesView from "./features/dashboard/teacher/TeacherNoticesView";

import InstituteNoticesView from "./features/dashboard/institute/InstituteNoticesView";

import Report from "./features/dashboard/teacher/Report";


import TeacherSupportForm from "./features/dashboard/teacher/TeacherSupportForm";
import AdminSupportTickets from "./features/dashboard/admin/AdminSupportTickets";
import AdminSupportTicketDetails from "./features/dashboard/admin/AdminSupportTicketDetails";
import AdminSupportCategories from "./features/dashboard/admin/AdminSupportCategories";
import TeacherSupportTickets from "./features/dashboard/teacher/TeacherSupportTickets";
import TeacherSupportTicketDetails from "./features/dashboard/teacher/TeacherSupportTicketDetails";


import InstituteSupportForm from "./features/dashboard/institute/InstituteSupportForm";
import InstituteSupportTickets from "./features/dashboard/institute/InstituteSupportTickets";
import InstituteSupportTicketDetails from "./features/dashboard/institute/InstituteSupportTicketDetails";

import FeeWaiverForm from "./features/dashboard/student/FeeWaiverForm";
import FeeWaiverRequests from "./features/dashboard/teacher/FeeWaiverRequests";

import PersonalizedPath from "./features/dashboard/student/PersonalizedPath";

import TeacherPaymentHistory from "./features/dashboard/teacher/PaymentHistory";

import InstitutePaymentHistory from "./features/dashboard/institute/PaymentHistory";

import ManageMaterials from "./features/dashboard/teacher/ManageMaterials";
import SelectClassForMaterials from "./features/dashboard/teacher/SelectClassForMaterials";

import StudyPackPaymentForm from "./features/dashboard/student/StudyPackPaymentForm";

import TeacherList from "./features/dashboard/admin/TeacherList";
import InstituteList from "./features/dashboard/admin/InstituteList";

import AddTeacherPage from "./features/dashboard/institute/AddTeacherPage";

import StudentLeaderboard from "./features/dashboard/student/StudentLeaderboard";

import Analytics from "./features/dashboard/admin/Analytics";

import TeacherEditProfile from "./features/dashboard/teacher/TeacherEditProfile";

function App() {
    return (
        <Router>
            <Routes>

            <Route path="/admin/analytics" element={<ProtectedRoute role="admin"><Analytics/></ProtectedRoute>} />

            <Route path="/student/leaderboard" element={<StudentLeaderboard />} />
            <Route path="/institute/add-teacher" element={<ProtectedRoute role="institute"><AddTeacherPage /></ProtectedRoute>} />
            <Route path="/admin/teachers" element={<ProtectedRoute role="admin"><TeacherList /></ProtectedRoute>} />
            <Route path="/admin/institutes" element={<ProtectedRoute role="admin"><InstituteList /></ProtectedRoute>} />
            <Route path="/teacher/classes/select" element={<ProtectedRoute role="teacher"><SelectClassForMaterials /></ProtectedRoute>} />
            <Route path="/:classId/materials" element={<ProtectedRoute role="teacher"><ManageMaterials /></ProtectedRoute>} />


            <Route path="/teacher/classes/managematerials" element={<ProtectedRoute role="teacher"><ManageMaterials /></ProtectedRoute>} />
            <Route path="/teacher/payment-history" element={<ProtectedRoute role="teacher"><TeacherPaymentHistory /></ProtectedRoute>} />
            <Route path="/institute/payment-history" element={<ProtectedRoute role="institute"><InstitutePaymentHistory /></ProtectedRoute>} />


            <Route path="/student/personalied-path" element={<ProtectedRoute role="student"><PersonalizedPath /></ProtectedRoute>} />

            <Route path="/student/fee-waiver" element={<ProtectedRoute role="student"><FeeWaiverForm /></ProtectedRoute>} />
            <Route path="/teacher/fee-waiver-requests" element={<ProtectedRoute role="teacher"><FeeWaiverRequests /></ProtectedRoute>} />

            <Route path="/institute/support-form" element={<ProtectedRoute role="institute"><InstituteSupportForm /></ProtectedRoute>} />
            <Route path="/institute/support-tickets" element={<ProtectedRoute role="institute"><InstituteSupportTickets /></ProtectedRoute> } />
            <Route  path="/institute/support/ticket/:ticketId" element={<ProtectedRoute role="institute"><InstituteSupportTicketDetails /> </ProtectedRoute>} />



            <Route path="/admin/support/ticket"  element={ <ProtectedRoute role="admin"><AdminSupportTickets /></ProtectedRoute>} />
            <Route path="/admin/support/ticket/:ticketId" element={ <ProtectedRoute role="admin"><AdminSupportTicketDetails /></ProtectedRoute>} />
            <Route path="/admin/support/categories" element={<ProtectedRoute role="admin"><AdminSupportCategories /></ProtectedRoute>} />
            <Route path="/teacher/support-ticket" element={<ProtectedRoute role="teacher"><TeacherSupportTickets /></ProtectedRoute> } />
            <Route  path="/teacher/support/ticket/:ticketId" element={<ProtectedRoute role="teacher"><TeacherSupportTicketDetails /> </ProtectedRoute>} />
            <Route path="/teacher/support-form" element={<ProtectedRoute role="teacher"><TeacherSupportForm /></ProtectedRoute>} />
                    
                <Route path="/" element={<HomePage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/privacy-policy" element={<PageView />} />
                <Route path="/terms-of-service" element={<PageView />} />
                <Route path="/contact-us" element={<PageView />} />
                <Route path="/about-us" element={<PageView />} />
                <Route path="/knowledgebase" element={<Knowledgebase />} />
                <Route path="/knowledgebase/:category" element={<KnowledgebaseCategoryPage />} />



                <Route path="/contact" element={<ContactPage />} />
                <Route path="/login" element={<Login />} />
                
                <Route path="/:slug" element={<PageView />} />

                <Route path="/register" element={<RoleSelection />} />

                {/* Protected Routes */}
                <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
                
                <Route path="/admin/subscription" element={<ProtectedRoute role="admin"><Subscription /></ProtectedRoute>} />
                <Route path="/admin/library" element={<ProtectedRoute role="admin"><ManageLibrary /></ProtectedRoute>} />
                <Route path="/admin/pages" element={<ProtectedRoute role="admin">< AdminPages/></ProtectedRoute>} />
                <Route path="/admin/manage-faqs" element={<ProtectedRoute role="admin">< ManageFAQs/></ProtectedRoute>} />
                <Route path="/admin/manage-knwoledgebase" element={<ProtectedRoute role="admin">< ManageKnowledgebase/></ProtectedRoute>} />
                <Route path="/admin/contact-messages" element={<ProtectedRoute role="admin">< ContactMessages/></ProtectedRoute>} />
                
                <Route path="/teacher/quiz-generator" element={<ProtectedRoute role="teacher"><QuizGenerator /></ProtectedRoute>} />
                <Route path="/student/quizlist/quiz/:quizId" element={<ProtectedRoute role="student"><StudentQuiz /></ProtectedRoute>} />
                <Route path="/student/quizlist" element={<ProtectedRoute role="student"><StudentQuizList /></ProtectedRoute>} />
                

                <Route path="/student/doubt-resolver" element={<ProtectedRoute role="student"><DoubtResolver /></ProtectedRoute>} />
                <Route path="/student/dashboard/*" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
                <Route path="/student/library" element={<ProtectedRoute role="student"><StudentLibrary /></ProtectedRoute>} />
                <Route path="/teacher/library" element={<ProtectedRoute role="teacher"><TeacherLibrary  /></ProtectedRoute>} />
                
                <Route path="/student/dashboard/subscribe/:classId" element={<PaymentForm />} />
                <Route path="/student/dashboard/my-classes" element={<MyClasses />} />
                <Route path="/student/dashboard/my-classes/:classId/materials" element={<ClassMaterial />} />
                <Route path="/student/dashboard/available-classes" element={<ProtectedRoute role="student"><AvailableClasses /></ProtectedRoute>} />
                <Route path="/student/dashboard/payment-history" element={<ProtectedRoute role="student"><PaymentHistory /></ProtectedRoute>} /> 
                <Route path="/student/dashboard/refund-request" element={<ProtectedRoute role="student"><RefundRequest /></ProtectedRoute>} /> {/* New route */}
                <Route path="/student/dashboard/refund-history" element={<ProtectedRoute role="student"><RefundHistory /></ProtectedRoute>} /> {/* New route */}
                

                <Route path="/institute/dashboard" element={<ProtectedRoute role="institute"><InstituteDashboard /></ProtectedRoute>} />
                <Route path="/admin/pages/edit-page/:slug" element={<AdminEditPage />} />
                <Route path="/admin/edit-profile" element={<EditProfile />} />
                <Route path="/student/edit-profile" element={<StudentEditProfile />} />
                <Route path="/teacher/edit-profile" element={<TeacherEditProfile />} />

                <Route path="/admin/refund-management" element={<ProtectedRoute role="admin"><RefundManagement /></ProtectedRoute>} />

                <Route path="/student/studypacks/payment/:studyPackId" element={<StudyPackPaymentForm />} />

                <Route path="/teacher/dashboard" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
                <Route path="/teacher/classes/add" element={<ProtectedRoute role="teacher"><TeacherCreateClass/></ProtectedRoute>} />
                <Route path="/teacher/classses/view-all" element={<ProtectedRoute role="teacher"><TeacherViewAllClass/></ProtectedRoute>} />
                <Route path="/teacher/classes" element={<TeacherViewAllClass/>} />
                
        <Route path="/teacher/classes/:classId/update" element={<TeacherUpdateClass />} />

        <Route path="/teacher/classes/uploadmaterials" element={<ProtectedRoute role="teacher"><UploadMaterials/></ProtectedRoute>} />

        <Route path="/register/student" element={<StudentRegister />} />
                <Route path="/register/teacher" element={<TeacherRegister />} />
                <Route path="/register/institute" element={<InstituteRegister />} />


                
                <Route path="/student/dashboard/all-teachers" element={<ProtectedRoute role="student"><ActiveTeachers /></ProtectedRoute>} /> {/* New route */}
                <Route path="/teacher/extension-requests" element={<ProtectedRoute role="teacher"><ManageExtensionRequests /></ProtectedRoute>} />
               
<Route path="/teacher/upload-studypack" element={<UploadStudyPack />} />
<Route path="/student/studypacks" element={<StudyPacks />} />
<Route path="/student/purchased-studypacks" element={<PurchasedStudyPacks />} />

<Route path="/teacher/manage-studypacks" element={<ManageStudyPacks />} />

<Route path="/student/message" element={<ProtectedRoute role="student"><StudentMessage /></ProtectedRoute>} />
<Route path="/teacher/message" element={<TeacherMessage />} />


<Route path="/student/notices" element={<ProtectedRoute role="student"><StudentNotices /></ProtectedRoute>} />
<Route path="/student/notice/:noticeId" element={<ProtectedRoute role="student"><StudentNotices /></ProtectedRoute>} />
<Route path="/teacher/notices" element={<ProtectedRoute role="teacher"><TeacherNotices /></ProtectedRoute>} />

<Route path="/admin/notices" element={<ProtectedRoute role="admin"><AdminNotices /></ProtectedRoute>}  />
 {/* Teacher Routes */}
<Route path="/teacher/noticesview" element={<ProtectedRoute role="teacher"><TeacherNoticesView /> </ProtectedRoute>} />
<Route path="/teacher/noticesview/:noticeId" element={<ProtectedRoute role="teacher"><TeacherNoticesView /></ProtectedRoute> }  />

<Route path="/institute/notices/" element={<ProtectedRoute role="institute"><InstituteNoticesView  /> </ProtectedRoute>} />
<Route path="/institute/notice/:noticeId" element={<ProtectedRoute role="institute"><InstituteNoticesView /></ProtectedRoute> }  />


<Route path="/teacher/report" element={<ProtectedRoute role="teacher"> <Report /></ProtectedRoute>} />


</Routes>
        </Router>


    );
}

export default App;
