/**
 * validators/warden.validators.js
 * ---------------------------------
 * express-validator rules for warden endpoints.
 */

import { body, param, query } from "express-validator";

const VALID_STATUSES = ["PENDING", "ASSIGNED", "IN_PROGRESS", "CLOSED"]; // Excludes RESOLVED (only staff can resolve)
const VALID_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export const assignComplaintValidator = [
  body("staffId")
    .notEmpty().withMessage("Staff ID is required.")
    .isUUID().withMessage("Invalid staff ID format."),
];

export const updateStatusValidator = [
  body("status")
    .notEmpty().withMessage("Status is required.")
    .isIn(VALID_STATUSES).withMessage(`Status must be one of: ${VALID_STATUSES.join(", ")}`),
  body("remarks")
    .optional()
    .isLength({ max: 500 }).withMessage("Remarks cannot exceed 500 characters."),
];

export const updatePriorityValidator = [
  body("priority")
    .notEmpty().withMessage("Priority is required.")
    .isIn(VALID_PRIORITIES).withMessage(`Priority must be one of: ${VALID_PRIORITIES.join(", ")}`),
];

export const cancelComplaintValidator = [
  body("reason")
    .trim()
    .notEmpty().withMessage("Cancellation reason is required.")
    .isLength({ max: 500 }).withMessage("Reason cannot exceed 500 characters."),
];

export const createStaffValidator = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required.")
    .isLength({ max: 100 }).withMessage("Name cannot exceed 100 characters."),
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Invalid email format."),
  body("phone")
    .optional()
    .isMobilePhone().withMessage("Invalid phone number."),
  body("department")
    .trim()
    .notEmpty().withMessage("Department is required."),
  body("password")
    .notEmpty().withMessage("Password is required.")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
];

export const updateStaffValidator = [
  body("phone")
    .optional()
    .isMobilePhone().withMessage("Invalid phone number."),
  body("department")
    .optional()
    .trim()
    .notEmpty().withMessage("Department cannot be empty."),
];

export const deactivateStaffValidator = [
  body("isActive")
    .isBoolean().withMessage("isActive must be a boolean."),
];
