/**
 * controllers/warden.controller.js
 * ---------------------------------
 * Handles HTTP requests for Warden endpoints.
 */

import * as wardenService from "../services/warden.service.js";
import { ok, created } from "../utils/response.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await wardenService.getDashboardStats();
    ok(res, "Dashboard stats fetched successfully.", stats);
  } catch (err) {
    next(err);
  }
};

export const getAnalyticsData = async (req, res, next) => {
  try {
    const data = await wardenService.getAnalyticsData();
    ok(res, "Analytics data fetched successfully.", data);
  } catch (err) {
    next(err);
  }
};

export const getComplaints = async (req, res, next) => {
  try {
    const result = await wardenService.getComplaints(req.query);
    ok(res, "Complaints fetched successfully.", result.data, result.meta);
  } catch (err) {
    next(err);
  }
};

export const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await wardenService.getComplaintById(req.params.id);
    ok(res, "Complaint fetched successfully.", complaint);
  } catch (err) {
    next(err);
  }
};

export const assignComplaint = async (req, res, next) => {
  try {
    const complaint = await wardenService.assignComplaint(req.params.id, req.body.staffId, req.user.id);
    ok(res, "Complaint assigned successfully.", complaint);
  } catch (err) {
    next(err);
  }
};

export const updateComplaintStatus = async (req, res, next) => {
  try {
    const complaint = await wardenService.updateComplaintStatus(req.params.id, req.body, req.user.id);
    ok(res, "Complaint status updated successfully.", complaint);
  } catch (err) {
    next(err);
  }
};

export const updateComplaintPriority = async (req, res, next) => {
  try {
    const complaint = await wardenService.updateComplaintPriority(req.params.id, req.body, req.user.id);
    ok(res, "Complaint priority updated successfully.", complaint);
  } catch (err) {
    next(err);
  }
};

export const cancelComplaint = async (req, res, next) => {
  try {
    const complaint = await wardenService.cancelComplaint(req.params.id, req.body.reason, req.user.id);
    ok(res, "Complaint cancelled successfully.", complaint);
  } catch (err) {
    next(err);
  }
};

export const getStaff = async (req, res, next) => {
  try {
    const result = await wardenService.getStaff(req.query);
    ok(res, "Staff fetched successfully.", result.data, result.meta);
  } catch (err) {
    next(err);
  }
};

export const createStaff = async (req, res, next) => {
  try {
    const staff = await wardenService.createStaff(req.body);
    created(res, "Staff created successfully.", staff);
  } catch (err) {
    next(err);
  }
};

export const updateStaff = async (req, res, next) => {
  try {
    const staff = await wardenService.updateStaff(req.params.id, req.body);
    ok(res, "Staff updated successfully.", staff);
  } catch (err) {
    next(err);
  }
};

export const deactivateStaff = async (req, res, next) => {
  try {
    const staff = await wardenService.deactivateStaff(req.params.id, req.body.isActive);
    ok(res, `Staff ${req.body.isActive ? "activated" : "deactivated"} successfully.`, staff);
  } catch (err) {
    next(err);
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await wardenService.getNotifications(req.user.id);
    ok(res, "Notifications fetched successfully.", notifications);
  } catch (err) {
    next(err);
  }
};

export const markNotificationsRead = async (req, res, next) => {
  try {
    await wardenService.markNotificationsRead(req.user.id);
    ok(res, "Notifications marked as read.");
  } catch (err) {
    next(err);
  }
};
