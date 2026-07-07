/**
 * config/cors.js
 * --------------
 * Centralized CORS configuration.
 *
 * Whitelisted origins are read from the environment.
 * The config is exported so it can be consumed by both
 * the Express CORS middleware and any WebSocket layer added later.
 */

const ALLOWED_ORIGINS = [
  process.env.CLIENT_URL || "https://campusresolve-lyart.vercel.app",
  "https://campusresolve-lyart.vercel.app",
  "http://localhost:5173",
];

export const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, Postman, curl)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: Origin "${origin}" is not allowed.`));
    }
  },
  credentials: true, // Required for cookies (JWT refresh tokens)
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
