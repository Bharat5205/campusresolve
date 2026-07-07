/**
 * services/auth.service.js
 * -------------------------
 * All authentication and authorization business logic.
 *
 * Responsibilities:
 *  - User registration (hash password, validate unique constraints, create student, welcome email)
 *  - Login (verify credentials, active status, generate JWT access and refresh tokens)
 *  - Logout (invalidate refresh token in DB)
 *  - Refresh token rotation
 *  - Forgot password (generate OTP, bcrypt-hash, store in PasswordResetOTP, send SMTP email)
 *  - Verify OTP (compare user input to hashed OTP in database)
 *  - Reset password (update password, clean up OTP, force re-login)
 *  - Google OAuth integration (find existing user or provision new student)
 */

import bcrypt from "bcryptjs";
import prisma from "../config/database.js";
import { AppError } from "../utils/AppError.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { sendOTPEmail, sendWelcomeEmail, sendPasswordResetSuccessEmail } from "../utils/email.js";

const SALT_ROUNDS = 12;
const OTP_EXPIRY_MINUTES = 10;

/**
 * Strips sensitive fields (like password and refreshToken) from the user object.
 *
 * @param {object} user - User model object
 * @returns {object} Sanitized user object
 */
const sanitizeUser = (user) => {
  const { password, refreshToken, ...safeUser } = user;
  return safeUser;
};

/**
 * Registers a new student.
 * Public registration is restricted strictly to STUDENTs.
 */
export const register = async ({
  name,
  email,
  rollNumber,
  department,
  year,
  hostel,
  roomNumber,
  phone,
  password,
}) => {
  // Validate unique constraints
  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) {
    throw new AppError("An account with this email already exists.", 409);
  }

  const existingRoll = await prisma.user.findUnique({ where: { rollNumber } });
  if (existingRoll) {
    throw new AppError("An account with this roll number already exists.", 409);
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "STUDENT", // Enforce default role
      rollNumber,
      department,
      year,
      hostel,
      roomNumber,
      phone,
      isVerified: true, // Auto-verified for student sign-up flow
    },
  });

  // Dispatch welcome email asynchronously (non-blocking)
  sendWelcomeEmail(email, name).catch(() => {});

  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({ id: user.id });

  // Persist refresh token for rotation
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  return { user: sanitizeUser(user), accessToken, refreshToken };
};

/**
 * Authenticates a user by email and password.
 */
export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    throw new AppError("Invalid email or password.", 401);
  }

  if (!user.isActive) {
    throw new AppError("Your account has been deactivated. Please contact the warden.", 403);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError("Invalid email or password.", 401);
  }

  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({ id: user.id });

  // Persist refresh token
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  return { user: sanitizeUser(user), accessToken, refreshToken };
};

/**
 * Returns the current authenticated user's profile details.
 */
export const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      rollNumber: true,
      department: true,
      year: true,
      hostel: true,
      roomNumber: true,
      phone: true,
      profileImage: true,
      isActive: true,
      isVerified: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError("User not found.", 404);
  }

  return user;
};

/**
 * Invalidates the refresh token for a user.
 */
export const logout = async (token) => {
  if (!token) return;

  try {
    const decoded = verifyRefreshToken(token);
    await prisma.user.update({
      where: { id: decoded.id },
      data: { refreshToken: null },
    });
  } catch {
    // Token already expired/invalid; logout is idempotent
  }
};

/**
 * Verifies a refresh token and generates a new access token + user details.
 */
export const refreshAccessToken = async (token) => {
  if (!token) throw new AppError("Refresh token not provided.", 401);

  const decoded = verifyRefreshToken(token);

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user || user.refreshToken !== token) {
    throw new AppError("Invalid refresh token. Please log in again.", 401);
  }

  if (!user.isActive) {
    throw new AppError("Your account has been deactivated.", 403);
  }

  const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
  return { accessToken, user: sanitizeUser(user) };
};

/**
 * Initiates the password reset OTP flow.
 */
export const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({ where: { email } });
  // Always respond with success on controller to prevent email enumeration,
  // but do not dispatch OTP for non-existent users.
  if (!user) return;

  // Generate secure random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otp, SALT_ROUNDS);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Clean up any stale reset OTP records for this email
  await prisma.passwordResetOTP.deleteMany({
    where: { email },
  });

  // Store hashed OTP
  await prisma.passwordResetOTP.create({
    data: { email, otp: hashedOtp, expiresAt },
  });

  // Send SMTP Email
  await sendOTPEmail(email, otp, user.name);
};

/**
 * Verifies a reset OTP without mutating password.
 */
export const verifyOtp = async ({ email, otp }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError("Invalid OTP or email.", 400);

  const record = await prisma.passwordResetOTP.findFirst({
    where: { email, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    throw new AppError("OTP has expired or is invalid.", 400);
  }

  const isValid = await bcrypt.compare(otp, record.otp);
  if (!isValid) {
    throw new AppError("Invalid OTP.", 400);
  }

  return true;
};

/**
 * Resets password using valid OTP credentials.
 */
export const resetPassword = async ({ email, otp, newPassword }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError("Invalid request.", 400);

  const record = await prisma.passwordResetOTP.findFirst({
    where: { email, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    throw new AppError("OTP has expired. Please request a new one.", 400);
  }

  const isValid = await bcrypt.compare(otp, record.otp);
  if (!isValid) {
    throw new AppError("Invalid OTP.", 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  // Execute password update and OTP cleanup in a single transaction
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, refreshToken: null }, // Revoke all sessions on reset
    }),
    prisma.passwordResetOTP.deleteMany({
      where: { email },
    }),
  ]);

  // Asynchronously send confirmation email
  sendPasswordResetSuccessEmail(email, user.name).catch(() => {});
};

/**
 * Handles OAuth user login or student account provision.
 * Wardens and Staff are blocked from registration here.
 */
export const handleGoogleAuth = async (profile) => {
  const email = profile.emails?.[0]?.value;
  const googleId = profile.id;
  const name = profile.displayName;
  const profileImage = profile.photos?.[0]?.value;

  if (!email) {
    throw new AppError("Could not retrieve email from Google profile.", 400);
  }

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.log("User not found, provisioning new student profile...");
    // User does not exist — create STUDENT profile
    user = await prisma.user.create({
      data: {
        name,
        email,
        googleId,
        profileImage,
        role: "STUDENT",
        isVerified: true,
      },
    });
    console.log("New student provisioned:", user.id);
  } else {
    console.log("Existing user found:", user.id);
    // User exists — update Google links if needed
    const updateData = {};
    if (!user.googleId) updateData.googleId = googleId;
    if (!user.profileImage && profileImage) updateData.profileImage = profileImage;

    if (Object.keys(updateData).length > 0) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });
      console.log("User Google fields updated.");
    }
  }

  if (!user.isActive) {
    throw new AppError("Your account has been deactivated. Please contact the warden.", 403);
  }

  console.log("Generating JWT for user:", user.email);
  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken({ id: user.id });

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });
  console.log("JWT generated and stored successfully.");

  return { user: sanitizeUser(user), accessToken, refreshToken };
};
