/**
 * server.js - Application Entry Point
 * ------------------------------------
 * Responsible ONLY for:
 *  1. Loading environment variables
 *  2. Importing the configured Express app
 *  3. Starting the HTTP server
 *  4. Registering process-level error handlers
 *
 * All Express configuration lives in app.js.
 */

import "dotenv/config";
import app from "./app.js";
import { connectDatabase } from "./config/database.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Verify database connectivity before accepting traffic
    await connectDatabase();

    const server = app.listen(PORT, () => {
      console.log("─────────────────────────────────────────────────────");
      console.log(`  🚀 CampusResolve API running on port ${PORT}`);
      console.log(`  🌍 Environment : ${process.env.NODE_ENV}`);
      console.log(`  📦 Database    : Connected`);
      console.log("─────────────────────────────────────────────────────");
    });

    // ── Process-level error handlers ─────────────────────────────────────
    // Catch unhandled promise rejections (async code without try/catch)
    process.on("unhandledRejection", (reason, promise) => {
      console.error("❌ Unhandled Promise Rejection:", reason);
      // Graceful shutdown — allow in-flight requests to complete
      server.close(() => process.exit(1));
    });

    // Catch synchronous uncaught exceptions
    process.on("uncaughtException", (err) => {
      console.error("❌ Uncaught Exception:", err.message);
      server.close(() => process.exit(1));
    });

    // Graceful shutdown on SIGTERM (e.g. Docker stop, Kubernetes pod eviction)
    process.on("SIGTERM", () => {
      console.log("⚠️  SIGTERM received. Shutting down gracefully...");
      server.close(() => {
        console.log("✅ Server closed.");
        process.exit(0);
      });
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
}

startServer();
