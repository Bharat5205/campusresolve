/**
 * services/complaint.service.js
 * ------------------------------
 * API calls for complaint management.
 */

import api from "./api.js";

export const createComplaint = (data) => api.post("/complaints", data);
export const getComplaints = (params) => api.get("/complaints", { params });
export const getComplaintById = (id) => api.get(`/complaints/${id}`);
export const assignComplaint = (id, staffId) => api.patch(`/complaints/${id}/assign`, { staffId });
export const updateComplaintStatus = (id, data) => api.patch(`/complaints/${id}/status`, data);
export const deleteComplaint = (id) => api.delete(`/complaints/${id}`);
export const addComment = (id, content) => api.post(`/complaints/${id}/comments`, { content });
export const getComments = (id) => api.get(`/complaints/${id}/comments`);
