/**
 * validators/staff.validators.js
 * -------------------------------
 * Validation chains for Staff API endpoints.
 */

import { body, query } from "express-validator";

export const staffComplaintQueryValidator = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  query("status").optional().isIn(["PENDING", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED", "CANCELLED"]).withMessage("Invalid status"),
  query("priority").optional().isIn(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).withMessage("Invalid priority"),
];

export const progressUpdateValidator = [
  body("progressMessage")
    .trim()
    .notEmpty()
    .withMessage("Progress message is required.")
    .isLength({ min: 5, max: 500 })
    .withMessage("Progress message must be between 5 and 500 characters."),
];

export const resolveComplaintValidator = [
  body("resolutionNotes")
    .trim()
    .notEmpty()
    .withMessage("Resolution notes are required.")
    .isLength({ min: 5, max: 1000 })
    .withMessage("Resolution notes must be between 5 and 1000 characters."),
];
