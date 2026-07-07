/**
 * services/user.service.js
 * -------------------------
 * Business logic for user profile management.
 *
 * Prisma field selection ensures passwords and refresh tokens
 * are NEVER returned to the client.
 */

import prisma from "../config/database.js";
import { AppError } from "../utils/AppError.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

// Fields that are safe to return in all user responses
const SAFE_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  profileImage: true,
  phone: true,
  rollNumber: true,
  hostel: true,
  roomNumber: true,
  department: true,
  year: true,
  isActive: true,
  isVerified: true,
  createdAt: true,
};

export const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: SAFE_USER_SELECT,
  });

  if (!user) throw new AppError("User not found.", 404);
  return user;
};

export const updateUser = async (id, data) => {
  // Whitelist only updatable fields — prevents mass assignment
  const { name, phone, hostel, roomNumber, department } = data;

  const user = await prisma.user.update({
    where: { id },
    data: { name, phone, hostel, roomNumber, department },
    select: SAFE_USER_SELECT,
  });

  return user;
};

export const updateAvatar = async (userId, file) => {
  if (!file) throw new AppError("No file provided.", 400);

  const { url } = await uploadToCloudinary(file.path, "campusresolve/avatars");

  const user = await prisma.user.update({
    where: { id: userId },
    data: { profileImage: url },
    select: SAFE_USER_SELECT,
  });

  return user;
};

export const getAllStaff = async () => {
  return prisma.user.findMany({
    where: { role: "STAFF", isActive: true },
    select: SAFE_USER_SELECT,
    orderBy: { name: "asc" },
  });
};
