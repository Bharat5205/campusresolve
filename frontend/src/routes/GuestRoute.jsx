/**
 * routes/GuestRoute.jsx
 * ----------------------
 * Redirects authenticated users away from public pages (login, register).
 * Prevents logged-in users from accessing the login page.
 */

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { ROLE_DASHBOARD_MAP } from "../utils/constants.js";

export default function GuestRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    // Redirect to the appropriate dashboard based on role
    const dashboardPath = ROLE_DASHBOARD_MAP[user.role] || "/";
    return <Navigate to={dashboardPath} replace />;
  }

  return <Outlet />;
}
