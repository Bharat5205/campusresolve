/**
 * context/AuthContext.jsx
 * ------------------------
 * Global authentication state provider.
 *
 * Exposes:
 *  - user (object | null)
 *  - isLoading (boolean)
 *  - isAuthenticated (boolean)
 *  - login(email, password, rememberMe)
 *  - register(registerFields)
 *  - logout()
 *  - refreshUser() — refreshes profile data from /me
 */

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  refreshToken as refreshTokenApi,
  login as loginApi,
  register as registerApi,
  logout as logoutApi,
  getMe as getMeApi,
} from "../services/auth.service.js";
import { setAccessToken, clearAccessToken } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restores user session on boot or refresh
  const restoreSession = useCallback(async () => {
    try {
      const { data } = await refreshTokenApi();
      setAccessToken(data.data.accessToken);

      const { data: profile } = await getMeApi();
      setUser(profile.data);
    } catch {
      clearAccessToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // Handles email/password authentication login
  const login = useCallback(async ({ email, password, rememberMe }) => {
    const { data } = await loginApi({ email, password, rememberMe });
    setAccessToken(data.data.accessToken);
    setUser(data.data.user);
    return data.data.user;
  }, []);

  // Handles student registration and logs the user in immediately
  const register = useCallback(async (formData) => {
    const { data } = await registerApi(formData);
    setAccessToken(data.data.accessToken);
    setUser(data.data.user);
    return data.data.user;
  }, []);

  // Logs out user, clears token and cookie
  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // Ignore logout errors
    } finally {
      clearAccessToken();
      setUser(null);
      // Redirect to home/landing after logout cleanup
      window.location.href = "/";
    }
  }, []);

  // Refetches user profile manually
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await getMeApi();
      setUser(data.data);
    } catch {
      // Ignore refresh errors
    }
  }, []);

  const value = {
    user,
    setUser,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
