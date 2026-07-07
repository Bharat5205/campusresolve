/**
 * routes/ProtectedRoute.jsx
 * --------------------------
 * Route guard for authenticated-only pages.
 *
 * Shows a loading spinner while session is being restored.
 * Redirects to /login if not authenticated.
 * Optionally enforces a specific role (e.g., WARDEN only).
 */

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Show nothing (or a spinner) while session is being restored
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    let loginPath = "/login";
    if (location.pathname.startsWith("/warden")) {
      loginPath = "/warden-login";
    } else if (location.pathname.startsWith("/staff")) {
      loginPath = "/staff-login";
    }
    // Preserve the attempted URL so we can redirect back after login
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
