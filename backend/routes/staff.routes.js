/**
 * routes/staff.routes.js
 * -----------------------
 * Staff specific route definitions.
 */

import { Router } from "express";
import { authenticateUser, authorizeRoles } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import * as staffController from "../controllers/staff.controller.js";
import {
  staffComplaintQueryValidator,
  progressUpdateValidator,
  resolveComplaintValidator
} from "../validators/staff.validators.js";

const router = Router();

// All routes here are restricted to STAFF only
router.use(authenticateUser, authorizeRoles("STAFF"));

// Dashboard
router.get("/dashboard", staffController.getDashboardStats);

// Complaints Management
router.get("/complaints", staffComplaintQueryValidator, validate, staffController.getAssignedComplaints);
router.get("/complaints/:id", staffController.getComplaintById);
router.put("/complaints/:id/accept", staffController.acceptComplaint);
router.put("/complaints/:id/progress", progressUpdateValidator, validate, staffController.updateProgress);

// Resolution allows 1 image upload
router.put(
  "/complaints/:id/resolve",
  upload.single("resolutionImage"),
  resolveComplaintValidator,
  validate,
  staffController.resolveComplaint
);



// Notifications
router.get("/notifications", staffController.getNotifications);
router.put("/notifications/read", staffController.markNotificationsRead);

export default router;
