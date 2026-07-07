/**
 * controllers/complaint.controller.js
 * -------------------------------------
 * Handles HTTP request/response for complaint management endpoints.
 */

import * as complaintService from "../services/complaint.service.js";
import { ok, created } from "../utils/response.js";

export const createComplaint = async (req, res, next) => {
  try {
    const complaint = await complaintService.createComplaint(req.user.id, req.body, req.files);
    created(res, "Complaint raised successfully.", complaint);
  } catch (err) {
    next(err);
  }
};

export const getComplaints = async (req, res, next) => {
  try {
    const result = await complaintService.getComplaints(req.user, req.query);
    ok(res, "Complaints fetched successfully.", result.data, result.meta);
  } catch (err) {
    next(err);
  }
};

export const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await complaintService.getComplaintById(req.params.id, req.user);
    ok(res, "Complaint fetched successfully.", complaint);
  } catch (err) {
    next(err);
  }
};

export const assignComplaint = async (req, res, next) => {
  try {
    const complaint = await complaintService.assignComplaint(req.params.id, req.body.staffId);
    ok(res, "Complaint assigned successfully.", complaint);
  } catch (err) {
    next(err);
  }
};

export const updateComplaintStatus = async (req, res, next) => {
  try {
    const complaint = await complaintService.updateComplaintStatus(
      req.params.id,
      req.body,
      req.user
    );
    ok(res, "Complaint status updated.", complaint);
  } catch (err) {
    next(err);
  }
};

export const deleteComplaint = async (req, res, next) => {
  try {
    await complaintService.deleteComplaint(req.params.id, req.user.id);
    ok(res, "Complaint deleted successfully.");
  } catch (err) {
    next(err);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const comment = await complaintService.addComment(req.params.id, req.user.id, req.body.content);
    created(res, "Comment added.", comment);
  } catch (err) {
    next(err);
  }
};

export const getComments = async (req, res, next) => {
  try {
    const comments = await complaintService.getComments(req.params.id);
    ok(res, "Comments fetched successfully.", comments);
  } catch (err) {
    next(err);
  }
};
