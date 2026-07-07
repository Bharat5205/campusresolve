/**
 * config/database.js
 * ------------------
 * Manages the singleton Prisma client instance.
 *
 * Using a singleton prevents connection pool exhaustion from
 * accidentally creating multiple PrismaClient instances.
 *
 * In development (with hot-reload), this is stored on `global` to
 * survive module re-evaluations without opening new connections.
 */

import { PrismaClient } from "@prisma/client";

const createPrismaClient = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["warn", "error"],
  });
};

// Prevent multiple instances during development hot-reload
const prisma = globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}

/**
 * Verifies database connectivity on application startup.
 * Throws if the database cannot be reached so the server fails fast.
 */
export async function connectDatabase() {
  await prisma.$connect();
  console.log("✅ Database connected via Prisma");
}

export default prisma;
