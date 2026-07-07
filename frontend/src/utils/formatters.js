/**
 * utils/formatters.js
 * --------------------
 * Pure utility functions for formatting data in the UI.
 */

/**
 * Formats a date string to a readable format.
 * @param {string|Date} date
 * @param {object} [options] - Intl.DateTimeFormat options
 */
export const formatDate = (date, options = {}) => {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  }).format(new Date(date));
};

/**
 * Returns a relative time string (e.g., "2 hours ago").
 * @param {string|Date} date
 */
export const timeAgo = (date) => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 7) return formatDate(date);
  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMinutes > 0) return `${diffMinutes}m ago`;
  return "Just now";
};

/**
 * Capitalizes the first letter of a string.
 * @param {string} str
 */
export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

/**
 * Extracts initials from a name (up to 2 characters).
 * @param {string} name
 */
export const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};
