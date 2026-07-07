/**
 * middlewares/error.middleware.js
 * --------------------------------
 * Global error handler — must be the LAST middleware registered in app.js.
 *
 * Handles:
 *  - Custom AppError instances (operational errors)
 *  - Prisma known request errors (constraint violations, not found, etc.)
 *  - Unhandled/unexpected errors
 *
 * Never leaks stack traces in production.
 */

import { Prisma } from "@prisma/client";

export function errorHandler(err, req, res, _next) {
  // Default to 500 Internal Server Error
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || null;

  // ── Prisma Error Mapping ──────────────────────────────────────────────
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": // Unique constraint violation
        statusCode = 409;
        message = `A record with this ${err.meta?.target?.join(", ")} already exists.`;
        break;
      case "P2025": // Record not found
        statusCode = 404;
        message = "The requested record was not found.";
        break;
      case "P2003": // Foreign key constraint
        statusCode = 400;
        message = "Related record does not exist.";
        break;
      default:
        statusCode = 400;
        message = "Database operation failed.";
    }
  }

  // ── Validation Error (express-validator) ─────────────────────────────
  if (err.name === "ValidationError") {
    statusCode = 422;
  }

  // ── JWT Errors ────────────────────────────────────────────────────────
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token. Please log in again.";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Your session has expired. Please log in again.";
  }

  // ── Log in Development ────────────────────────────────────────────────
  // Error logging omitted in production build

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}
