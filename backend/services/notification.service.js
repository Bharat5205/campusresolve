/**
 * services/notification.service.js
 * ----------------------------------
 * Business logic for in-app notifications.
 *
 * Notifications are created internally by other services (e.g., complaint assignment).
 * Users can only read/delete their own notifications.
 */

import prisma from "../config/database.js";
import { AppError } from "../utils/AppError.js";

/**
 * Creates a notification for a user.
 * Called internally by other services — not exposed as an HTTP endpoint.
 *
 * @param {object} data - { recipientId, message, type, complaintId? }
 */
export const createNotification = async ({ recipientId, title, message, type, complaintId }) => {
  return prisma.notification.create({
    data: { recipientId, title, message, type, complaintId },
  });
};

/**
 * Fetches all unread and recent notifications for a user.
 */
export const getUserNotifications = async (userId) => {
  return prisma.notification.findMany({
    where: { recipientId: userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      title: true,
      message: true,
      type: true,
      isRead: true,
      createdAt: true,
      complaint: { select: { id: true, title: true, status: true } },
    },
  });
};

export const getUnreadCount = async (userId) => {
  return prisma.notification.count({
    where: { recipientId: userId, isRead: false },
  });
};

export const markAsRead = async (notificationId, userId) => {
  const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notification) throw new AppError("Notification not found.", 404);
  if (notification.recipientId !== userId) throw new AppError("Access denied.", 403);

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
};

export const markAllAsRead = async (userId) => {
  await prisma.notification.updateMany({
    where: { recipientId: userId, isRead: false },
    data: { isRead: true },
  });
};

export const deleteNotification = async (notificationId, userId) => {
  const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notification) throw new AppError("Notification not found.", 404);
  if (notification.recipientId !== userId) throw new AppError("Access denied.", 403);

  await prisma.notification.delete({ where: { id: notificationId } });
};
