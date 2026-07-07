/**
 * utils/constants.js
 * -------------------
 * Application-wide constants.
 * Single source of truth for enums, labels, and config values.
 */

// Maps user roles to their dashboard routes
export const ROLE_DASHBOARD_MAP = {
  STUDENT: "/student/dashboard",
  WARDEN: "/warden/dashboard",
  STAFF: "/staff/dashboard",
};

export const COMPLAINT_STATUS = {
  PENDING:     { label: "Pending",     color: "bg-yellow-100 text-yellow-800" },
  ASSIGNED:    { label: "Assigned",    color: "bg-blue-100 text-blue-800" },
  IN_PROGRESS: { label: "In Progress", color: "bg-purple-100 text-purple-800" },
  RESOLVED:    { label: "Resolved",    color: "bg-green-100 text-green-800" },
  CLOSED:      { label: "Closed",      color: "bg-gray-100 text-gray-800" },
};

export const COMPLAINT_PRIORITY = {
  LOW:      { label: "Low",      color: "bg-gray-100 text-gray-700" },
  MEDIUM:   { label: "Medium",   color: "bg-blue-100 text-blue-700" },
  HIGH:     { label: "High",     color: "bg-orange-100 text-orange-700" },
  CRITICAL: { label: "Critical", color: "bg-red-100 text-red-700" },
};

export const COMPLAINT_CATEGORIES = [
  "Electrical",
  "Plumbing",
  "Sanitation",
  "Furniture",
  "Network",
  "Carpentry",
  "Civil",
  "Other",
];

export const USER_ROLES = {
  STUDENT: "STUDENT",
  WARDEN:  "WARDEN",
  STAFF:   "STAFF",
};
