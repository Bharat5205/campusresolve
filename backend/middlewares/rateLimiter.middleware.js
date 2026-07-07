/**
 * middlewares/rateLimiter.middleware.js
 * --------------------------------------
 * Rate limiting configuration to protect against brute-force and DoS attacks.
 *
 * globalRateLimiter  - Applied to ALL routes (generous limit)
 * authRateLimiter    - Applied to login/register (strict limit)
 */

import rateLimit from "express-rate-limit";

const isDev = process.env.NODE_ENV === "development";

const createRateLimiter = (windowMinutes, max, message) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    // In development, set limit to 1000 so it never blocks testing
    max: isDev ? 1000 : max,
    message: {
      success: false,
      message,
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });

// 100 requests per 15 minutes per IP for general API access (Production)
export const globalRateLimiter = createRateLimiter(
  15,
  100,
  "Too many requests from this IP. Please try again after 15 minutes."
);

// 20 requests per 15 minutes for auth endpoints (Production)
export const authRateLimiter = createRateLimiter(
  15,
  20,
  "Too many authentication attempts. Please try again after 15 minutes."
);
