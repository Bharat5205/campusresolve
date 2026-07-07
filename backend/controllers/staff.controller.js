/**
 * controllers/staff.controller.js
 * --------------------------------
 * Handles HTTP requests for Staff endpoints.
 */

import * as staffService from "../services/staff.service.js";
import { ok } from "../utils/response.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await staffService.getDashboardStats(req.user.id);
    ok(res, "Dashboard stats fetched successfully.", stats);
  } catch (err) {
    next(err);
  }
};

export const getAssignedComplaints = async (req, res, next) => {
  try {
    const result = await staffService.getAssignedComplaints(req.user.id, req.query);
    ok(res, "Assigned complaints fetched successfully.", result.data, result.meta);
  } catch (err) {
    next(err);
  }
};

export const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await staffService.getComplaintById(req.user.id, req.params.id);
    ok(res, "Complaint fetched successfully.", complaint);
  } catch (err) {
    next(err);
  }
};

export const acceptComplaint = async (req, res, next) => {
  try {
    const complaint = await staffService.acceptComplaint(req.user.id, req.params.id);
    ok(res, "Complaint accepted successfully.", complaint);
  } catch (err) {
    next(err);
  }
};

export const updateProgress = async (req, res, next) => {
  try {
    const complaint = await staffService.updateProgress(req.user.id, req.params.id, req.body.progressMessage);
    ok(res, "Progress updated successfully.", complaint);
  } catch (err) {
    next(err);
  }
};

export const resolveComplaint = async (req, res, next) => {
  try {
    const complaint = await staffService.resolveComplaint(req.user.id, req.params.id, req.body.resolutionNotes, req.file);
    ok(res, "Complaint marked as resolved successfully.", complaint);
  } catch (err) {
    next(err);
  }
};



export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await staffService.getNotifications(req.user.id);
    ok(res, "Notifications fetched successfully.", notifications);
  } catch (err) {
    next(err);
  }
};

export const markNotificationsRead = async (req, res, next) => {
  try {
    await staffService.markNotificationsRead(req.user.id);
    ok(res, "Notifications marked as read.");
  } catch (err) {
    next(err);
  }
};
