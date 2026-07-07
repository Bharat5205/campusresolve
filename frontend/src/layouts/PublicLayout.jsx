/**
 * layouts/PublicLayout.jsx
 * -------------------------
 * Wrapper for all public (unauthenticated) pages: Landing, Login, Register, Forgot Password.
 * Provides minimal chrome — no sidebar, no authenticated navbar.
 */

import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-indigo-50">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: "8px",
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
          },
        }}
      />
      <Outlet />
    </div>
  );
}
