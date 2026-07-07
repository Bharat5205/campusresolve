/**
 * routes/warden.routes.js
 * ------------------------
 * Warden specific route definitions.
 */

import { Router } from "express";
import { authenticateUser, authorizeRoles } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import * as wardenController from "../controllers/warden.controller.js";
import { complaintQueryValidator } from "../validators/complaint.validators.js";
import {
  assignComplaintValidator,
  updateStatusValidator,
  updatePriorityValidator,
  cancelComplaintValidator,
  createStaffValidator,
  updateStaffValidator,
  deactivateStaffValidator,
} from "../validators/warden.validators.js";

const router = Router();

// All routes here are restricted to WARDEN only
router.use(authenticateUser, authorizeRoles("WARDEN"));

// Dashboard & Analytics
router.get("/dashboard", wardenController.getDashboardStats);
router.get("/analytics", wardenController.getAnalyticsData);

// Complaint Management
router.get("/complaints", complaintQueryValidator, validate, wardenController.getComplaints);
router.get("/complaints/:id", wardenController.getComplaintById);
router.put("/complaints/:id/assign", assignComplaintValidator, validate, wardenController.assignComplaint);
router.put("/complaints/:id/status", updateStatusValidator, validate, wardenController.updateComplaintStatus);
router.put("/complaints/:id/priority", updatePriorityValidator, validate, wardenController.updateComplaintPriority);
router.put("/complaints/:id/cancel", cancelComplaintValidator, validate, wardenController.cancelComplaint);

// Staff Management
router.get("/staff", wardenController.getStaff);
router.post("/staff", createStaffValidator, validate, wardenController.createStaff);
router.put("/staff/:id", updateStaffValidator, validate, wardenController.updateStaff);
router.put("/staff/:id/deactivate", deactivateStaffValidator, validate, wardenController.deactivateStaff);

// Notifications
router.get("/notifications", wardenController.getNotifications);
router.put("/notifications/read", wardenController.markNotificationsRead);

export default router;
