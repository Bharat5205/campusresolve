/**
 * app.js - Express Application Configuration
 * -------------------------------------------
 * Sets up and exports the Express app instance.
 * Registers all global middleware, routes, and error handlers.
 *
 * This file does NOT start the HTTP server — that is server.js's job.
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import passport from "passport";

import { corsOptions } from "./config/cors.js";
import { globalRateLimiter } from "./middlewares/rateLimiter.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { notFoundHandler } from "./middlewares/notFound.middleware.js";
import { configurePassport } from "./config/passport.js";

// Route imports — add new route modules here as features are built
import apiRouter from "./routes/index.js";

const app = express();

// ── Security Middleware ────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────────────────
app.use(cors(corsOptions));

// ── Request Logging ────────────────────────────────────────────────────────
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// ── Body Parsing ───────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Cookie Parsing ─────────────────────────────────────────────────────────
app.use(cookieParser());

// ── Passport Initialization ────────────────────────────────────────────────
configurePassport(passport);
app.use(passport.initialize());

// ── Global Rate Limiter ────────────────────────────────────────────────────
app.use(globalRateLimiter);

// ── Health Check ───────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "campusresolve-api",
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ─────────────────────────────────────────────────────────────
app.use("/api", apiRouter);

// ── 404 Handler ────────────────────────────────────────────────────────────
app.use(notFoundHandler);

// ── Global Error Handler ───────────────────────────────────────────────────
// Must be the LAST middleware registered
app.use(errorHandler);

export default app;
