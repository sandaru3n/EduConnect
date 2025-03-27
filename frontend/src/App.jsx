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
import ManageLibrary from "./features/dashboard/admin/EBookUpload";


import StudentLibrary from "./features/dashboard/student/eLibrary";
import TeacherLibrary from "./features/dashboard/student/eLibrary";
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


function App() {
    return (
        <Router>
            <Routes>
                
                <Route path="/" element={<HomePage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/privacy-policy" element={<PageView />} />
                <Route path="/terms-of-service" element={<PageView />} />
                <Route path="/contact-us" element={<PageView />} />
                <Route path="/about-us" element={<PageView />} />



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

                
                
                <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
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

                <Route path="/admin/refund-management" element={<ProtectedRoute role="admin"><RefundManagement /></ProtectedRoute>} />



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
                
               
<Route path="/teacher/upload-studypack" element={<UploadStudyPack />} />
<Route path="/student/studypacks" element={<StudyPacks />} />
<Route path="/student/purchased-studypacks" element={<PurchasedStudyPacks />} />

<Route path="/teacher/manage-studypacks" element={<ManageStudyPacks />} />

<Route path="/student/message" element={<ProtectedRoute role="student"><StudentMessage /></ProtectedRoute>} />
<Route path="/teacher/message" element={<TeacherMessage />} />
            </Routes>
        </Router>


    );
}

export default App;
