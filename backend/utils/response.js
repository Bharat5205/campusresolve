/**
 * utils/response.js
 * ------------------
 * Standardized API response helpers.
 *
 * All controllers must use these helpers to maintain a consistent
 * response envelope across the entire API.
 *
 * Success envelope:  { success: true,  message, data, meta }
 * Error envelope:    { success: false, message, errors }  ← handled by errorHandler
 */

/**
 * Sends a successful JSON response.
 *
 * @param {object} res        - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message    - Human-readable success message
 * @param {*}      [data]     - Response payload
 * @param {object} [meta]     - Pagination or extra metadata
 */
export const sendSuccess = (res, statusCode, message, data = null, meta = null) => {
  const payload = { success: true, message };
  if (data !== null) payload.data = data;
  if (meta !== null) payload.meta = meta;
  return res.status(statusCode).json(payload);
};

/**
 * Sends a 200 OK response.
 */
export const ok = (res, message, data, meta) =>
  sendSuccess(res, 200, message, data, meta);

/**
 * Sends a 201 Created response.
 */
export const created = (res, message, data) =>
  sendSuccess(res, 201, message, data);

/**
 * Sends a 204 No Content response.
 */
export const noContent = (res) => res.status(204).send();
