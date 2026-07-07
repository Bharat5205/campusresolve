import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layouts & Guards (Keep these synchronous to avoid layout flash)
import PublicLayout from "./layouts/PublicLayout.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import GuestRoute from "./routes/GuestRoute.jsx";

// Global Loading Fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
      <p className="text-gray-500 font-medium animate-pulse">Loading CampusResolve...</p>
    </div>
  </div>
);

// Lazy loaded public pages
const Landing = lazy(() => import("./pages/Landing.jsx"));
const StudentLogin = lazy(() => import("./pages/auth/StudentLogin.jsx"));
const WardenLogin = lazy(() => import("./pages/auth/WardenLogin.jsx"));
const StaffLogin = lazy(() => import("./pages/auth/StaffLogin.jsx"));
const Register = lazy(() => import("./pages/auth/Register.jsx"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword.jsx"));
const VerifyOtp = lazy(() => import("./pages/auth/VerifyOtp.jsx"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword.jsx"));
const GoogleCallback = lazy(() => import("./pages/auth/GoogleCallback.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));
const Unauthorized = lazy(() => import("./pages/Unauthorized.jsx"));

// Lazy loaded Dashboard pages
const StudentDashboard = lazy(() => import("./pages/student/StudentDashboard.jsx"));
const StudentNewComplaint = lazy(() => import("./pages/student/StudentNewComplaint.jsx"));
const StudentComplaintDetails = lazy(() => import("./pages/student/StudentComplaintDetails.jsx"));
const WardenDashboard = lazy(() => import("./pages/warden/WardenDashboard.jsx"));
const WardenComplaints = lazy(() => import("./pages/warden/WardenComplaints.jsx"));
const WardenComplaintDetails = lazy(() => import("./pages/warden/WardenComplaintDetails.jsx"));
const WardenStaff = lazy(() => import("./pages/warden/WardenStaff.jsx"));
const WardenNotifications = lazy(() => import("./pages/warden/WardenNotifications.jsx"));
const WardenProfile = lazy(() => import("./pages/warden/WardenProfile.jsx"));
const StaffDashboard = lazy(() => import("./pages/staff/StaffDashboard.jsx"));
const StaffAssignments = lazy(() => import("./pages/staff/StaffAssignments.jsx"));
const StaffComplaintDetails = lazy(() => import("./pages/staff/StaffComplaintDetails.jsx"));
const StaffNotifications = lazy(() => import("./pages/staff/StaffNotifications.jsx"));
const StaffProfile = lazy(() => import("./pages/staff/StaffProfile.jsx"));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ── Public Routes ──────────────────────────────────── */}
          <Route element={<PublicLayout />}>
            <Route index element={<Landing />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Guest-only routes: redirect authenticated users to their dashboard */}
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<StudentLogin />} />
              <Route path="/warden-login" element={<WardenLogin />} />
              <Route path="/staff-login" element={<StaffLogin />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-otp" element={<VerifyOtp />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>

            {/* OAuth Callback — must be public (not guest-gated) */}
            <Route path="/auth/callback" element={<GoogleCallback />} />
          </Route>

          {/* ── Protected Routes ───────────────────────────────── */}
          <Route element={<DashboardLayout />}>
            {/* Student-only */}
            <Route element={<ProtectedRoute allowedRoles={["STUDENT"]} />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/complaints/new" element={<StudentNewComplaint />} />
              <Route path="/student/complaints/:id" element={<StudentComplaintDetails />} />
            </Route>

            {/* Warden-only */}
            <Route element={<ProtectedRoute allowedRoles={["WARDEN"]} />}>
              <Route path="/warden/dashboard" element={<WardenDashboard />} />
              <Route path="/warden/complaints" element={<WardenComplaints />} />
              <Route path="/warden/complaints/:id" element={<WardenComplaintDetails />} />
              <Route path="/warden/staff" element={<WardenStaff />} />
              <Route path="/warden/notifications" element={<WardenNotifications />} />
              <Route path="/warden/profile" element={<WardenProfile />} />
            </Route>

            {/* Staff-only */}
            <Route element={<ProtectedRoute allowedRoles={["STAFF"]} />}>
              <Route path="/staff/dashboard" element={<StaffDashboard />} />
              <Route path="/staff/assignments" element={<StaffAssignments />} />
              <Route path="/staff/complaints/:id" element={<StaffComplaintDetails />} />
              <Route path="/staff/notifications" element={<StaffNotifications />} />
              <Route path="/staff/profile" element={<StaffProfile />} />
            </Route>
          </Route>

          {/* ── Catch-all ──────────────────────────────────────── */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
