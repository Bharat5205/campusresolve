/**
 * validators/auth.validators.js
 * ------------------------------
 * express-validator rules for all authentication endpoints.
 *
 * Usage:
 *   import { registerValidator } from '../validators/auth.validators.js'
 *   router.post('/register', registerValidator, validate, authController.register)
 */

import { body } from "express-validator";

export const registerValidator = [
  body("name")
    .trim()
    .notEmpty().withMessage("Full name is required.")
    .isLength({ min: 2, max: 100 }).withMessage("Name must be between 2 and 100 characters."),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Please provide a valid email address.")
    .normalizeEmail(),

  body("rollNumber")
    .trim()
    .notEmpty().withMessage("Roll number is required.")
    .isLength({ min: 3, max: 30 }).withMessage("Roll number must be between 3 and 30 characters."),

  body("department")
    .trim()
    .notEmpty().withMessage("Department is required."),

  body("year")
    .trim()
    .notEmpty().withMessage("Year is required."),

  body("hostel")
    .trim()
    .notEmpty().withMessage("Hostel is required."),

  body("roomNumber")
    .trim()
    .notEmpty().withMessage("Room number is required."),

  body("phone")
    .trim()
    .notEmpty().withMessage("Phone number is required.")
    .matches(/^[0-9+\-\s()]{10,20}$/).withMessage("Please provide a valid phone number."),

  body("password")
    .notEmpty().withMessage("Password is required.")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters.")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=\[\]{}|\\:;"'<>,.?/~`]).*$/)
    .withMessage("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."),

  body("confirmPassword")
    .notEmpty().withMessage("Confirm password is required.")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password confirmation does not match password.");
      }
      return true;
    }),
];

export const loginValidator = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Please provide a valid email address.")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required."),
];

export const forgotPasswordValidator = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Please provide a valid email address.")
    .normalizeEmail(),
];

export const verifyOtpValidator = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Please provide a valid email address.")
    .normalizeEmail(),

  body("otp")
    .notEmpty().withMessage("OTP is required.")
    .isLength({ min: 6, max: 6 }).withMessage("OTP must be exactly 6 digits.")
    .isNumeric().withMessage("OTP must be numeric."),
];

export const resetPasswordValidator = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Please provide a valid email address.")
    .normalizeEmail(),

  body("otp")
    .notEmpty().withMessage("OTP is required.")
    .isLength({ min: 6, max: 6 }).withMessage("OTP must be exactly 6 digits.")
    .isNumeric().withMessage("OTP must be numeric."),

  body("newPassword")
    .notEmpty().withMessage("New password is required.")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters.")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=\[\]{}|\\:;"'<>,.?/~`]).*$/)
    .withMessage("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."),
];
