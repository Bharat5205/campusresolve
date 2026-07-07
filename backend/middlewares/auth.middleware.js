/**
 * middlewares/auth.middleware.js
 * --------------------------------
 * Authentication & Authorization middleware.
 *
 * authenticateUser  - Verifies the JWT access token from the Authorization header.
 *                     Attaches the decoded user payload to req.user.
 *
 * authorizeRoles    - Role-based access control factory.
 *                     Returns a middleware that restricts access to specified roles.
 *
 * NOTE: Full implementation will be completed in Phase 2 (Authentication Module).
 * These stubs establish the correct signature and integration point.
 */

import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";

/**
 * Extracts and verifies the Bearer JWT from the Authorization header.
 * Populates req.user with { id, email, role } on success.
 */
export const authenticateUser = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Authentication required. Please log in.", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    // Let the global error handler translate JWT errors to proper responses
    next(err);
  }
};

/**
 * Role-based authorization factory.
 *
 * Usage: router.get('/path', authenticateUser, authorizeRoles('WARDEN', 'STAFF'), controller)
 *
 * @param  {...string} roles - Allowed roles (STUDENT | WARDEN | STAFF)
 * @returns Express middleware function
 */
export const authorizeRoles = (...roles) => {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError(
          "You do not have permission to perform this action.",
          403
        )
      );
    }
    next();
  };
};
