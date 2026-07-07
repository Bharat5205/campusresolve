/**
 * routes/user.routes.js
 * ----------------------
 * User management route definitions.
 *
 * Endpoints:
 *   GET    /api/users/me            - Get current user profile
 *   PATCH  /api/users/me            - Update current user profile
 *   PATCH  /api/users/me/avatar     - Upload/update profile avatar
 *   GET    /api/users/staff         - Warden: List all staff members
 *   GET    /api/users/:id           - Warden: Get any user profile
 */

import { Router } from "express";
import { authenticateUser, authorizeRoles } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";
import * as userController from "../controllers/user.controller.js";

const router = Router();

// All user routes require authentication
router.use(authenticateUser);

router.get("/me", userController.getMyProfile);
router.patch("/me", userController.updateMyProfile);
router.patch("/me/avatar", upload.single("avatar"), userController.updateAvatar);

// Warden-only routes
router.get("/staff", authorizeRoles("WARDEN"), userController.getAllStaff);
router.get("/:id", authorizeRoles("WARDEN"), userController.getUserById);

export default router;
