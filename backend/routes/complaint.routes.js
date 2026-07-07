/**
 * routes/complaint.routes.js
 * ---------------------------
 * Complaint management route definitions.
 *
 * Endpoints:
 *   POST   /api/complaints                       - Student: Raise a new complaint
 *   GET    /api/complaints                       - Get complaints (filtered by role)
 *   GET    /api/complaints/:id                   - Get a single complaint
 *   PATCH  /api/complaints/:id/assign            - Warden: Assign complaint to staff
 *   PATCH  /api/complaints/:id/status            - Staff/Warden: Update complaint status
 *   DELETE /api/complaints/:id                   - Student: Delete own pending complaint
 *   POST   /api/complaints/:id/comments          - Add a comment to a complaint
 *   GET    /api/complaints/:id/comments          - Get all comments for a complaint
 */

import { Router } from "express";
import { authenticateUser, authorizeRoles } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  createComplaintValidator,
  updateStatusValidator,
  assignComplaintValidator,
  complaintQueryValidator,
  addCommentValidator,
} from "../validators/complaint.validators.js";
import * as complaintController from "../controllers/complaint.controller.js";

const router = Router();

// All complaint routes require authentication
router.use(authenticateUser);

router.post(
  "/",
  authorizeRoles("STUDENT"),
  upload.array("images", 5),
  createComplaintValidator,
  validate,
  complaintController.createComplaint
);

router.get(
  "/",
  complaintQueryValidator,
  validate,
  complaintController.getComplaints
);

router.get("/:id", complaintController.getComplaintById);

router.patch(
  "/:id/assign",
  authorizeRoles("WARDEN"),
  assignComplaintValidator,
  validate,
  complaintController.assignComplaint
);

router.patch(
  "/:id/status",
  authorizeRoles("WARDEN", "STAFF"),
  updateStatusValidator,
  validate,
  complaintController.updateComplaintStatus
);

router.delete("/:id", authorizeRoles("STUDENT"), complaintController.deleteComplaint);

// Comment sub-routes
router.post(
  "/:id/comments",
  addCommentValidator,
  validate,
  complaintController.addComment
);
router.get("/:id/comments", complaintController.getComments);

export default router;
