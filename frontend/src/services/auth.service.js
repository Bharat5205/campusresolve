/**
 * services/auth.service.js
 * -------------------------
 * API calls for all authentication operations.
 * Each function maps directly to one backend endpoint.
 */

import api from "./api.js";

export const register = (data) => api.post("/auth/register", data);
export const login = (data) => api.post("/auth/login", data);
export const logout = () => api.post("/auth/logout");
export const refreshToken = () => api.post("/auth/refresh-token");
export const forgotPassword = (email) => api.post("/auth/forgot-password", { email });
export const verifyOtp = (data) => api.post("/auth/verify-otp", data);
export const resetPassword = (data) => api.post("/auth/reset-password", data);
export const getMe = () => api.get("/auth/me");
