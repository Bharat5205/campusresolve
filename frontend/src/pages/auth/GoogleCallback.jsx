/**
 * pages/auth/GoogleCallback.jsx
 * ------------------------------
 * Phase 2 - Google OAuth Callback Page.
 * Catches the JWT token passed by the backend redirect, initializes context session,
 * and routes the authenticated user to their role-based dashboard.
 */

import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext.jsx";
import { setAccessToken } from "../../services/api.js";
import { ROLE_DASHBOARD_MAP } from "../../utils/constants.js";

export default function GoogleCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      // Store access token in JS memory
      setAccessToken(token);

      // Fetch user profile from /me and redirect
      refreshUser()
        .then(() => {
          toast.success("Logged in with Google successfully!");
          // The refreshUser updates the user state. We can redirect to landing or dashboard.
          // Since the profile fetch succeeded, we read the role from a temporary profile fetch
          // or navigate to landing which will automatically route via GuestRoute or Auth check.
          // To be explicit, we can retrieve user from context directly after state update,
          // or read from the context API. Let's do a direct navigation to landing "/" which redirects
          // based on context user, or decode the token payload directly to know the role!
          // Decoding the JWT payload is super fast and clean:
          try {
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            const payload = JSON.parse(window.atob(base64));
            
            const dashboardPath = ROLE_DASHBOARD_MAP[payload.role] || "/";
            navigate(dashboardPath, { replace: true });
          } catch {
            navigate("/", { replace: true });
          }
        })
        .catch(() => {
          toast.error("Google authentication failed during profile fetch.");
          navigate("/login", { replace: true });
        });
    } else {
      toast.error("Authentication token not found.");
      navigate("/login", { replace: true });
    }
  }, [searchParams, navigate, refreshUser]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent mb-4" />
      <p className="text-gray-600 text-sm font-medium">Finalizing Google authentication...</p>
    </div>
  );
}
