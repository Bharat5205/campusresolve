/**
 * Prisma Seed File
 * -----------------
 * Seeds the database with initial data for development & testing.
 * Run: `node prisma/seed.js` or `npm run prisma:seed`
 *
 * Seeds:
 * - 1 Warden account
 * - 2 Student accounts
 * - 2 Staff accounts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function main() {
  console.log("🌱 Starting database seed...");

  // ── Warden ──────────────────────────────────────────────────────────────
  const warden = await prisma.user.upsert({
    where: { email: "warden@campusresolve.com" },
    update: {},
    create: {
      name: "Dr. Ramesh Kumar",
      email: "warden@campusresolve.com",
      password: await hashPassword("Warden@123"),
      role: "WARDEN",
      department: "Hostel Administration",
      isVerified: true,
      isActive: true,
    },
  });

  // ── Staff ────────────────────────────────────────────────────────────────
  const staff1 = await prisma.user.upsert({
    where: { email: "staff1@campusresolve.com" },
    update: {},
    create: {
      name: "Suresh Babu",
      email: "staff1@campusresolve.com",
      password: await hashPassword("Staff@123"),
      role: "STAFF",
      department: "Electrical",
      isVerified: true,
      isActive: true,
    },
  });

  const staff2 = await prisma.user.upsert({
    where: { email: "staff2@campusresolve.com" },
    update: {},
    create: {
      name: "Mohan Lal",
      email: "staff2@campusresolve.com",
      password: await hashPassword("Staff@123"),
      role: "STAFF",
      department: "Plumbing",
      isVerified: true,
      isActive: true,
    },
  });

  // ── Students ─────────────────────────────────────────────────────────────
  const student1 = await prisma.user.upsert({
    where: { email: "student1@campusresolve.com" },
    update: {},
    create: {
      name: "Arjun Sharma",
      email: "student1@campusresolve.com",
      password: await hashPassword("Student@123"),
      role: "STUDENT",
      rollNumber: "CS19B1001",
      year: "4th Year",
      hostel: "Block A",
      roomNumber: "A-204",
      isVerified: true,
      isActive: true,
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: "student2@campusresolve.com" },
    update: {},
    create: {
      name: "Priya Nair",
      email: "student2@campusresolve.com",
      password: await hashPassword("Student@123"),
      role: "STUDENT",
      rollNumber: "CS19B1002",
      year: "4th Year",
      hostel: "Block B",
      roomNumber: "B-112",
      isVerified: true,
      isActive: true,
    },
  });

  console.log("✅ Seed completed successfully.");
  console.log("─────────────────────────────────────────");
  console.log(`  Warden   : ${warden.email}`);
  console.log(`  Staff 1  : ${staff1.email}`);
  console.log(`  Staff 2  : ${staff2.email}`);
  console.log(`  Student 1: ${student1.email}`);
  console.log(`  Student 2: ${student2.email}`);
  console.log("─────────────────────────────────────────");
  console.log("  Default password: Role@123 (e.g. Warden@123)");
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
