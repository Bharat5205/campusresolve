/**
 * utils/jwt.js
 * ------------
 * JWT utility functions for token generation and verification.
 *
 * Follows a dual-token strategy:
 *  - Access Token  : Short-lived (e.g. 7d), sent in Authorization header
 *  - Refresh Token : Long-lived (e.g. 30d), stored in HttpOnly cookie
 *
 * NOTE: Token verification is handled in auth.middleware.js for access tokens.
 * This utility provides the generation helpers used by the auth service.
 */

import jwt from "jsonwebtoken";

/**
 * Generates a short-lived JWT access token.
 *
 * @param {object} payload - { id, email, role }
 * @returns {string} JWT access token
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "7d",
  });
};

/**
 * Generates a long-lived JWT refresh token.
 *
 * @param {object} payload - { id }
 * @returns {string} JWT refresh token
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || "30d",
  });
};

/**
 * Verifies a refresh token.
 *
 * @param {string} token - JWT refresh token
 * @returns {object} Decoded payload
 * @throws {JsonWebTokenError | TokenExpiredError}
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

/**
 * Sets the refresh token as an HttpOnly secure cookie.
 *
 * @param {object} res   - Express response object
 * @param {string} token - Refresh token value
 */
export const setRefreshTokenCookie = (res, token, rememberMe = true) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  if (rememberMe) {
    cookieOptions.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
  }

  res.cookie("refreshToken", token, cookieOptions);
};

/**
 * Clears the refresh token cookie on logout.
 *
 * @param {object} res - Express response object
 */
export const clearRefreshTokenCookie = (res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
};
