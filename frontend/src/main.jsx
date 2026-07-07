/**
 * main.jsx - React Application Bootstrap
 * ----------------------------------------
 * Wraps the app in all global providers.
 * Provider order matters:
 *  1. AuthProvider     — must be outermost (other providers may need auth state)
 *  2. NotificationProvider — depends on auth
 */

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </AuthProvider>
  </StrictMode>
);
