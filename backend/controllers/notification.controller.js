/**
 * controllers/notification.controller.js
 * ----------------------------------------
 * Handles HTTP request/response for notification endpoints.
 */

import * as notificationService from "../services/notification.service.js";
import { ok, noContent } from "../utils/response.js";

export const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getUserNotifications(req.user.id);
    ok(res, "Notifications fetched successfully.", notifications);
  } catch (err) {
    next(err);
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const count = await notificationService.getUnreadCount(req.user.id);
    ok(res, "Unread count fetched successfully.", { count });
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    await notificationService.markAsRead(req.params.id, req.user.id);
    ok(res, "Notification marked as read.");
  } catch (err) {
    next(err);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    ok(res, "All notifications marked as read.");
  } catch (err) {
    next(err);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    await notificationService.deleteNotification(req.params.id, req.user.id);
    noContent(res);
  } catch (err) {
    next(err);
  }
};
