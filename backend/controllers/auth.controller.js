/**
 * controllers/auth.controller.js
 * --------------------------------
 * Handles HTTP request/response for authentication endpoints.
 *
 * Controllers MUST:
 *   ✅ Extract data from req (body, params, cookies, user)
 *   ✅ Call the appropriate service method
 *   ✅ Return a structured response using response helpers
 *
 * Controllers MUST NOT:
 *   ❌ Contain business logic
 *   ❌ Directly query the database
 *   ❌ Perform input validation (handled by validators)
 */

import * as authService from "../services/auth.service.js";
import { ok, created } from "../utils/response.js";
import { setRefreshTokenCookie, clearRefreshTokenCookie } from "../utils/jwt.js";

export const register = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.register(req.body);
    setRefreshTokenCookie(res, refreshToken, true);
    created(res, "Account created successfully.", { user, accessToken });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;
    const { user, accessToken, refreshToken } = await authService.login({ email, password });
    setRefreshTokenCookie(res, refreshToken, !!rememberMe);
    ok(res, "Login successful.", { user, accessToken });
  } catch (err) {
    next(err);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    ok(res, "Current user fetched successfully.", user);
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    await authService.logout(req.cookies.refreshToken);
    clearRefreshTokenCookie(res);
    ok(res, "Logged out successfully.");
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const result = await authService.refreshAccessToken(req.cookies.refreshToken);
    ok(res, "Token refreshed.", result);
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    await authService.forgotPassword(req.body.email);
    ok(res, "OTP sent to your registered email address.");
  } catch (err) {
    next(err);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    await authService.verifyOtp(req.body);
    ok(res, "OTP verified successfully.");
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    await authService.resetPassword(req.body);
    ok(res, "Password reset successfully. Please log in.");
  } catch (err) {
    next(err);
  }
};

export const googleCallback = async (req, res, next) => {
  try {
    const { user, accessToken, refreshToken } = await authService.handleGoogleAuth(req.user);
    setRefreshTokenCookie(res, refreshToken);
    // Redirect to frontend with access token as query param (handled by frontend)
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${accessToken}`);
  } catch (err) {
    next(err);
  }
};
