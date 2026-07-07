/**
 * services/api.js
 * ----------------
 * Single, reusable Axios instance for all API calls.
 *
 * Configuration:
 *  - Base URL reads from Vite env variable
 *  - Credentials (cookies) included for refresh token flow
 *  - Request interceptor: attaches access token from memory store
 *  - Response interceptor: handles 401 → token refresh → retry
 *
 * NEVER create another Axios instance anywhere in the project.
 * All API calls go through this instance.
 */

import axios from "axios";

const envUrl = import.meta.env.VITE_API_URL || "";
const apiBaseUrl = envUrl.endsWith("/api") ? envUrl : `${envUrl}/api`;

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true, // Send/receive HttpOnly cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// ── In-memory access token store ───────────────────────────────────────────
// NOT stored in localStorage (XSS risk). Lives in JS memory — cleared on page refresh.
// On refresh, the /auth/refresh-token endpoint restores it via the HttpOnly cookie.
let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const clearAccessToken = () => {
  accessToken = null;
};

// ── Request Interceptor ────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ───────────────────────────────────────────────────
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const notifyRefreshSubscribers = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Attempt token refresh only on 401, and not on auth routes
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/")
    ) {
      if (isRefreshing) {
        // Queue requests while refresh is in progress
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post("/auth/refresh-token");
        const newToken = data.data.accessToken;
        setAccessToken(newToken);
        notifyRefreshSubscribers(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch {
        clearAccessToken();
        // Redirect to appropriate login if refresh fails
        let loginPath = "/login";
        if (window.location.pathname.startsWith("/warden")) {
          loginPath = "/warden-login";
        } else if (window.location.pathname.startsWith("/staff")) {
          loginPath = "/staff-login";
        }
        window.location.href = loginPath;
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
