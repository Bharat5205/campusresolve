/**
 * validators/complaint.validators.js
 * ------------------------------------
 * express-validator rules for complaint endpoints.
 */

import { body, param, query } from "express-validator";

const VALID_CATEGORIES = [
  "Electrical",
  "Plumbing",
  "Sanitation",
  "Furniture",
  "Network",
  "Carpentry",
  "Civil",
  "Other",
];

const VALID_STATUSES = ["PENDING", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const VALID_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export const createComplaintValidator = [
  body("title")
    .trim()
    .notEmpty().withMessage("Title is required.")
    .isLength({ min: 5, max: 200 }).withMessage("Title must be between 5 and 200 characters."),

  body("description")
    .trim()
    .notEmpty().withMessage("Description is required.")
    .isLength({ min: 10, max: 2000 }).withMessage("Description must be between 10 and 2000 characters."),

  body("category")
    .notEmpty().withMessage("Category is required.")
    .isIn(VALID_CATEGORIES).withMessage(`Category must be one of: ${VALID_CATEGORIES.join(", ")}`),

  body("priority")
    .optional()
    .isIn(VALID_PRIORITIES).withMessage(`Priority must be one of: ${VALID_PRIORITIES.join(", ")}`),

  body("location")
    .trim()
    .notEmpty().withMessage("Location is required.")
    .isLength({ min: 3, max: 200 }).withMessage("Location must be between 3 and 200 characters."),
];

export const updateStatusValidator = [
  body("status")
    .notEmpty().withMessage("Status is required.")
    .isIn(VALID_STATUSES).withMessage(`Status must be one of: ${VALID_STATUSES.join(", ")}`),

  body("remarks")
    .optional()
    .isLength({ max: 500 }).withMessage("Remarks cannot exceed 500 characters."),
];

export const assignComplaintValidator = [
  body("staffId")
    .notEmpty().withMessage("Staff ID is required.")
    .isUUID().withMessage("Invalid staff ID format."),
];

export const complaintQueryValidator = [
  query("status").optional().isIn(VALID_STATUSES),
  query("priority").optional().isIn(VALID_PRIORITIES),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer."),
  query("limit").optional().isInt({ min: 1, max: 100 }),
];

export const addCommentValidator = [
  body("content")
    .trim()
    .notEmpty().withMessage("Comment content is required.")
    .isLength({ max: 1000 }).withMessage("Comment cannot exceed 1000 characters."),
];
