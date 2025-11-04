import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./Components/Shared/ProtectedRoute";

// Auth Pages
import Login from "./Pages/Auth/Login";
import Register from "./Pages/Auth/Register";
import AdminRegister from "./Pages/Auth/AdminRegister";

// Alumni Pages
import AlumniDashboardPage from "./Pages/Alumini/Home";
import AlumniJobpage from "./Pages/Alumini/ApplyJobpage";
import AlumniPhotopage from "./Pages/Alumini/Photopage";
import AlumniLiveUpdatesPage from "./Pages/Alumini/LiveUpdatespage";
import AlumniFeedbackpage from "./Pages/Alumini/Feedbackpage";
import AlumniProfilepage from "./Pages/Alumini/Profilepage";

// Admin Pages
import AdminDashboardPage from "./Pages/Admin/Adminpage";
import AdminBatchpage from "./Pages/Admin/AdminBatchpage";
import AdminPhotopage from "./Pages/Admin/AdminPhotopage";
import AdminJobpage from "./Pages/Admin/AdminJobpage";
import AdminUpdatespage from "./Pages/Admin/AdminUpdatespage";
import AdminStudentpage from "./Pages/Admin/AdminStudentpage";
import AdminFeedbackpage from "./Pages/Admin/AdminFeedbackpage";

// Student Pages
import StudentDashboardPage from "./Pages/Students/StudentDashboardPage";
import StudentApplyJobPage from "./Pages/Students/ApplyJobpage";
import StudentPhotopage from "./Pages/Students/Photopage";
import StudentLiveUpdatesPage from "./Pages/Students/LiveUpdatespage";
import StudentFeedbackpage from "./Pages/Students/Feedbackpage";
import StudentProfilepage from "./Pages/Students/Profilepage";
import StudentViewProfilePage from "./Pages/Students/ViewProfilePage";

// SuperAdmin Pages
import SuperAdminDashboardPage from "./Pages/SuperAdmin/SuperAdminDashboardPage";
import SuperAdminAdminpage from "./Pages/SuperAdmin/SuperAdminAdminpage";
import SuperAdminBatchpage from "./Pages/SuperAdmin/SuperAdminBatchpage";
import SuperAdminStudentpage from "./Pages/SuperAdmin/SuperAdminStudentpage";
import SuperAdminAllUsersPage from "./Pages/SuperAdmin/SuperAdminAllUsersPage";
import SuperAdminJobpage from "./Pages/SuperAdmin/SuperAdminJobpage";
import SuperAdminPhotopage from "./Pages/SuperAdmin/SuperAdminPhotopage";
import SuperAdminUpdatespage from "./Pages/SuperAdmin/SuperAdminUpdatespage";
import SuperAdminFeedbackpage from "./Pages/SuperAdmin/SuperAdminFeedbackpage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/register" element={<AdminRegister />} />

        {/* Alumni Routes - Only alumni can access */}
        <Route path="/alumini/dash" element={<ProtectedRoute allowedRoles={['alumni']}><AlumniDashboardPage /></ProtectedRoute>} />
        <Route path="/alumini/apply-job" element={<ProtectedRoute allowedRoles={['alumni']}><AlumniJobpage /></ProtectedRoute>} />
        <Route path="/alumini/photo-gallery" element={<ProtectedRoute allowedRoles={['alumni']}><AlumniPhotopage /></ProtectedRoute>} />
        <Route path="/alumini/live-updates" element={<ProtectedRoute allowedRoles={['alumni']}><AlumniLiveUpdatesPage /></ProtectedRoute>} />
        <Route path="/alumini/feedback" element={<ProtectedRoute allowedRoles={['alumni']}><AlumniFeedbackpage /></ProtectedRoute>} />
        <Route path="/alumini/update-profile" element={<ProtectedRoute allowedRoles={['alumni']}><AlumniProfilepage /></ProtectedRoute>} />

        {/* Admin Routes - Only admin can access */}
        <Route path="/admin/dash" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboardPage /></ProtectedRoute>} />
        <Route path="/admin/batch" element={<ProtectedRoute allowedRoles={['admin']}><AdminBatchpage /></ProtectedRoute>} />
        <Route path="/admin/job" element={<ProtectedRoute allowedRoles={['admin']}><AdminJobpage /></ProtectedRoute>} />
        <Route path="/admin/photo" element={<ProtectedRoute allowedRoles={['admin']}><AdminPhotopage /></ProtectedRoute>} />
        <Route path="/admin/updates" element={<ProtectedRoute allowedRoles={['admin']}><AdminUpdatespage /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminStudentpage /></ProtectedRoute>} />
        <Route path="/admin/feedback" element={<ProtectedRoute allowedRoles={['admin']}><AdminFeedbackpage /></ProtectedRoute>} />

        {/* Student Routes - Only student can access */}
        <Route path="/student/dash" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboardPage /></ProtectedRoute>} />
        <Route path="/student/apply-job" element={<ProtectedRoute allowedRoles={['student']}><StudentApplyJobPage /></ProtectedRoute>} />
        <Route path="/student/photo-gallery" element={<ProtectedRoute allowedRoles={['student']}><StudentPhotopage /></ProtectedRoute>} />
        <Route path="/student/live-updates" element={<ProtectedRoute allowedRoles={['student']}><StudentLiveUpdatesPage /></ProtectedRoute>} />
        <Route path="/student/feedback" element={<ProtectedRoute allowedRoles={['student']}><StudentFeedbackpage /></ProtectedRoute>} />
        <Route path="/student/update-profile" element={<ProtectedRoute allowedRoles={['student']}><StudentProfilepage /></ProtectedRoute>} />
        <Route path="/student/view-profile/:userId" element={<ProtectedRoute allowedRoles={['student']}><StudentViewProfilePage /></ProtectedRoute>} />

        {/* SuperAdmin Routes - Only superadmin can access */}
        <Route path="/superadmin/dash" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminDashboardPage /></ProtectedRoute>} />
        <Route path="/superadmin/admins" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminAdminpage /></ProtectedRoute>} />
        <Route path="/superadmin/batch" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminBatchpage /></ProtectedRoute>} />
        <Route path="/superadmin/all-users" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminAllUsersPage /></ProtectedRoute>} />
        <Route path="/superadmin/users" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminStudentpage /></ProtectedRoute>} />
        <Route path="/superadmin/job" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminJobpage /></ProtectedRoute>} />
        <Route path="/superadmin/photo" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminPhotopage /></ProtectedRoute>} />
        <Route path="/superadmin/updates" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminUpdatespage /></ProtectedRoute>} />
        <Route path="/superadmin/feedback" element={<ProtectedRoute allowedRoles={['superadmin']}><SuperAdminFeedbackpage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
