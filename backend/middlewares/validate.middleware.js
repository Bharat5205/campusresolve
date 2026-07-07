/**
 * middlewares/validate.middleware.js
 * -----------------------------------
 * Collects express-validator errors and returns a 422 response
 * if validation fails. If validation passes, calls next().
 *
 * Usage:
 *   router.post('/route', [...validationRules], validate, controller)
 */

import { validationResult } from "express-validator";

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation failed. Please check your input.",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }

  next();
};
