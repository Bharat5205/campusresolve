/**
 * middlewares/notFound.middleware.js
 * -----------------------------------
 * Catches all requests to undefined routes and forwards
 * a 404 error to the global error handler.
 */

import { AppError } from "../utils/AppError.js";

export function notFoundHandler(req, _res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}
