/**
 * routes/notification.routes.js
 * ------------------------------
 * Notification route definitions.
 *
 * Endpoints:
 *   GET    /api/notifications          - Get current user's notifications
 *   PATCH  /api/notifications/:id/read - Mark a notification as read
 *   PATCH  /api/notifications/read-all - Mark all notifications as read
 *   DELETE /api/notifications/:id      - Delete a notification
 */

import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import * as notificationController from "../controllers/notification.controller.js";

const router = Router();

router.use(authenticateUser);

router.get("/", notificationController.getMyNotifications);
router.get("/unread-count", notificationController.getUnreadCount);

// Support both PATCH and PUT
router.patch("/read-all", notificationController.markAllAsRead);
router.put("/read-all", notificationController.markAllAsRead);

router.patch("/:id/read", notificationController.markAsRead);
router.put("/:id/read", notificationController.markAsRead);

router.delete("/:id", notificationController.deleteNotification);

export default router;
