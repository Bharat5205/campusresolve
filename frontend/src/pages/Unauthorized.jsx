/**
 * pages/Unauthorized.jsx
 * -----------------------
 * Shown when an authenticated user tries to access a page they don't have permission for.
 */

import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { ROLE_DASHBOARD_MAP } from "../utils/constants.js";

export default function Unauthorized() {
  const { user } = useAuth();
  const dashboardPath = user ? ROLE_DASHBOARD_MAP[user.role] : "/";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <p className="text-7xl mb-4">🔒</p>
      <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
      <p className="text-gray-500 mt-2 max-w-sm">
        You don't have permission to view this page.
      </p>
      <Link to={dashboardPath} className="btn-primary mt-8">
        Go to Dashboard
      </Link>
    </div>
  );
}
