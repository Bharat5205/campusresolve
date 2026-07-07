/**
 * services/complaint.service.js
 * ------------------------------
 * All complaint management business logic.
 *
 * Responsibilities:
 *  - Role-aware complaint fetching (students see own, wardens/staff see all)
 *  - Complaint creation with image uploads
 *  - Status transitions with validation
 *  - Assignment with notification dispatch
 *  - Comment management
 *
 * NOTE: Implementation stubs. Logic added in Phase 3 (Complaint Module).
 */

import prisma from "../config/database.js";
import { AppError } from "../utils/AppError.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
// createNotification will be used in Phase 4 when notification dispatch is implemented
// import { createNotification } from "./notification.service.js";

const COMPLAINT_SELECT = {
  id: true,
  title: true,
  description: true,
  category: true,
  status: true,
  priority: true,
  location: true,
  images: true,
  remarks: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
  assignedAt: true,
  raisedBy: {
    select: { id: true, name: true, email: true, hostel: true, roomNumber: true },
  },
  assignedTo: {
    select: { id: true, name: true, email: true, department: true },
  },
};

// ── Query Helpers ──────────────────────────────────────────────────────────

const buildWhereClause = (user, query) => {
  const where = {};

  // Students can only view their own complaints
  if (user.role === "STUDENT") where.raisedById = user.id;

  // Staff can only view complaints assigned to them
  if (user.role === "STAFF") where.assignedToId = user.id;

  // Optional filters (available to Warden, partially to others)
  if (query.status) where.status = query.status;
  if (query.priority) where.priority = query.priority;
  if (query.category) where.category = { contains: query.category, mode: "insensitive" };

  return where;
};

// ── Service Functions ──────────────────────────────────────────────────────

export const createComplaint = async (userId, body, files = []) => {
  const imageUploadPromises = files.map((file) =>
    uploadToCloudinary(file.path, "campusresolve/complaints")
  );

  const uploadedImages = await Promise.all(imageUploadPromises);
  const images = uploadedImages.map((img) => img.url);

  const complaint = await prisma.complaint.create({
    data: {
      title: body.title,
      description: body.description,
      category: body.category,
      priority: body.priority || "LOW",
      location: body.location,
      images,
      raisedById: userId,
    },
    select: COMPLAINT_SELECT,
  });

  // Notify Wardens
  const wardens = await prisma.user.findMany({ where: { role: "WARDEN", isActive: true } });
  if (wardens.length > 0) {
    await prisma.notification.createMany({
      data: wardens.map(w => ({
        title: "New Complaint",
        message: `A new complaint has been raised: ${complaint.title}`,
        type: "NEW_COMPLAINT",
        recipientId: w.id,
        complaintId: complaint.id,
      }))
    });
  }

  return complaint;
};

export const getComplaints = async (user, query = {}) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;
  const where = buildWhereClause(user, query);

  const [complaints, total] = await prisma.$transaction([
    prisma.complaint.findMany({
      where,
      select: COMPLAINT_SELECT,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.complaint.count({ where }),
  ]);

  return {
    data: complaints,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const getComplaintById = async (id, user) => {
  const complaint = await prisma.complaint.findUnique({
    where: { id },
    select: COMPLAINT_SELECT,
  });

  if (!complaint) throw new AppError("Complaint not found.", 404);

  // Students can only view their own complaints
  if (user.role === "STUDENT" && complaint.raisedBy.id !== user.id) {
    throw new AppError("Access denied.", 403);
  }

  return complaint;
};

export const assignComplaint = async (complaintId, staffId) => {
  const [complaint, staff] = await Promise.all([
    prisma.complaint.findUnique({ where: { id: complaintId } }),
    prisma.user.findUnique({ where: { id: staffId, role: "STAFF" } }),
  ]);

  if (!complaint) throw new AppError("Complaint not found.", 404);
  if (!staff) throw new AppError("Staff member not found.", 404);
  if (complaint.status === "RESOLVED" || complaint.status === "CLOSED") {
    throw new AppError("Cannot reassign a resolved or closed complaint.", 400);
  }

  const updated = await prisma.complaint.update({
    where: { id: complaintId },
    data: {
      assignedToId: staffId,
      status: "ASSIGNED",
      assignedAt: new Date(),
    },
    select: COMPLAINT_SELECT,
  });

  // Notifications are dispatched from warden.service.js instead

  return updated;
};

export const updateComplaintStatus = async (complaintId, body, user) => {
  const complaint = await prisma.complaint.findUnique({ where: { id: complaintId } });
  if (!complaint) throw new AppError("Complaint not found.", 404);

  // Staff can only update complaints assigned to them
  if (user.role === "STAFF" && complaint.assignedToId !== user.id) {
    throw new AppError("You are not assigned to this complaint.", 403);
  }

  const data = { status: body.status };
  if (body.remarks) data.remarks = body.remarks;
  if (body.status === "RESOLVED") data.resolvedAt = new Date();

  return prisma.complaint.update({
    where: { id: complaintId },
    data,
    select: COMPLAINT_SELECT,
  });
};

export const deleteComplaint = async (complaintId, userId) => {
  const complaint = await prisma.complaint.findUnique({ where: { id: complaintId } });
  if (!complaint) throw new AppError("Complaint not found.", 404);
  if (complaint.raisedById !== userId) throw new AppError("Access denied.", 403);
  if (complaint.status !== "PENDING") {
    throw new AppError("Only pending complaints can be deleted.", 400);
  }

  await prisma.complaint.delete({ where: { id: complaintId } });
};

export const addComment = async (complaintId, authorId, content) => {
  if (!content?.trim()) throw new AppError("Comment content cannot be empty.", 400);

  const complaint = await prisma.complaint.findUnique({ where: { id: complaintId } });
  if (!complaint) throw new AppError("Complaint not found.", 404);

  return prisma.comment.create({
    data: { complaintId, authorId, content: content.trim() },
    select: {
      id: true,
      content: true,
      createdAt: true,
      author: { select: { id: true, name: true, role: true, profileImage: true } },
    },
  });
};

export const getComments = async (complaintId) => {
  return prisma.comment.findMany({
    where: { complaintId },
    select: {
      id: true,
      content: true,
      createdAt: true,
      author: { select: { id: true, name: true, role: true, profileImage: true } },
    },
    orderBy: { createdAt: "asc" },
  });
};
