/**
 * routes/auth.routes.js
 * ----------------------
 * Authentication route definitions.
 *
 * Routes only define endpoints, HTTP methods, middleware chains, and handler references.
 * No business logic lives here.
 *
 * Endpoints:
 *   POST   /api/auth/register            - Register with email & password
 *   POST   /api/auth/login               - Login with email & password
 *   POST   /api/auth/logout              - Logout & clear refresh token cookie
 *   POST   /api/auth/refresh-token       - Issue new access token via refresh token
 *   POST   /api/auth/forgot-password     - Send OTP to email
 *   POST   /api/auth/verify-otp          - Verify OTP
 *   POST   /api/auth/reset-password      - Reset password with new credentials
 *   GET    /api/auth/google              - Initiate Google OAuth flow
 *   GET    /api/auth/google/callback     - Google OAuth callback
 */

import { Router } from "express";
import passport from "passport";
import { authRateLimiter } from "../middlewares/rateLimiter.middleware.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  verifyOtpValidator,
  resetPasswordValidator,
} from "../validators/auth.validators.js";
import * as authController from "../controllers/auth.controller.js";

const router = Router();

// Apply strict rate limiting to all auth endpoints
router.use(authRateLimiter);

// ── Email/Password Auth ────────────────────────────────────────────────────
router.post("/register", registerValidator, validate, authController.register);
router.post("/login", loginValidator, validate, authController.login);
router.post("/logout", authController.logout);
router.post("/refresh-token", authController.refreshToken);

// ── Password Reset ─────────────────────────────────────────────────────────
router.post("/forgot-password", forgotPasswordValidator, validate, authController.forgotPassword);
router.post("/verify-otp", verifyOtpValidator, validate, authController.verifyOtp);
router.post("/reset-password", resetPasswordValidator, validate, authController.resetPassword);

// ── Current User ───────────────────────────────────────────────────────────
router.get("/me", authenticateUser, authController.getCurrentUser);

// ── Google OAuth ───────────────────────────────────────────────────────────
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed`,
  }),
  authController.googleCallback
);

export default router;
