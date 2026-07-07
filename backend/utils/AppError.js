/**
 * utils/AppError.js
 * ------------------
 * Custom error class for operational (expected) errors.
 *
 * Distinguishes between operational errors (known, safe to expose)
 * and programmer errors (unknown, must NOT be exposed to the client).
 *
 * All intentional errors thrown in services/controllers should use AppError.
 */

export class AppError extends Error {
  /**
   * @param {string} message   - Human-readable error message
   * @param {number} statusCode - HTTP status code (400, 401, 403, 404, 409, etc.)
   * @param {Array}  [errors]  - Optional validation error array
   */
  constructor(message, statusCode, errors = null) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}
