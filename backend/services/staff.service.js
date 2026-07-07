/**
 * services/staff.service.js
 * ----------------------------
 * Business logic for the Staff module.
 */

import prisma from "../config/database.js";
import { AppError } from "../utils/AppError.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const COMPLAINT_SELECT = {
  id: true,
  title: true,
  description: true,
  category: true,
  status: true,
  priority: true,
  location: true,
  images: true,
  resolutionImage: true,
  resolutionNotes: true,
  createdAt: true,
  assignedAt: true,
  acceptedAt: true,
  resolvedAt: true,
  raisedBy: { select: { name: true, email: true, hostel: true, roomNumber: true, phone: true } },
  histories: {
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      action: true,
      oldValue: true,
      newValue: true,
      reason: true,
      createdAt: true,
      actor: { select: { name: true, role: true } },
    }
  },
  comments: {
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      content: true,
      createdAt: true,
      author: { select: { name: true, role: true, profileImage: true } }
    }
  }
};

export const getDashboardStats = async (staffId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    assignedToday,
    pending,
    inProgress,
    resolvedToday,
    totalCompleted
  ] = await Promise.all([
    prisma.complaint.count({
      where: { assignedToId: staffId, assignedAt: { gte: today } }
    }),
    prisma.complaint.count({
      where: { assignedToId: staffId, status: "ASSIGNED" }
    }),
    prisma.complaint.count({
      where: { assignedToId: staffId, status: "IN_PROGRESS" }
    }),
    prisma.complaint.count({
      where: { assignedToId: staffId, status: "RESOLVED", resolvedAt: { gte: today } }
    }),
    prisma.complaint.count({
      where: { assignedToId: staffId, status: { in: ["RESOLVED", "CLOSED"] } }
    })
  ]);

  return {
    assignedToday,
    pending,
    inProgress,
    resolvedToday,
    totalCompleted
  };
};

export const getAssignedComplaints = async (staffId, query = {}) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where = { assignedToId: staffId, status: { notIn: ["CANCELLED"] } };
  
  if (query.status) where.status = query.status;
  if (query.priority) where.priority = query.priority;
  if (query.category) where.category = { contains: query.category, mode: "insensitive" };

  if (query.search) {
    where.OR = [
      { id: { contains: query.search, mode: "insensitive" } },
      { raisedBy: { name: { contains: query.search, mode: "insensitive" } } },
    ];
  }

  const [complaints, total] = await prisma.$transaction([
    prisma.complaint.findMany({
      where,
      select: COMPLAINT_SELECT,
      orderBy: query.sort === "oldest" ? { createdAt: "asc" } : { createdAt: "desc" },
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

export const getComplaintById = async (staffId, complaintId) => {
  const complaint = await prisma.complaint.findUnique({
    where: { id: complaintId, assignedToId: staffId },
    select: COMPLAINT_SELECT,
  });

  if (!complaint) throw new AppError("Complaint not found or not assigned to you.", 404);
  return complaint;
};

export const acceptComplaint = async (staffId, complaintId) => {
  const complaint = await prisma.complaint.findUnique({
    where: { id: complaintId, assignedToId: staffId }
  });

  if (!complaint) throw new AppError("Complaint not found or not assigned to you.", 404);
  if (complaint.status !== "ASSIGNED") throw new AppError("Complaint is not in ASSIGNED state.", 400);

  const updated = await prisma.$transaction(async (tx) => {
    const res = await tx.complaint.update({
      where: { id: complaintId },
      data: {
        status: "IN_PROGRESS",
        acceptedAt: new Date(),
      },
      select: COMPLAINT_SELECT,
    });

    await tx.complaintHistory.create({
      data: {
        complaintId,
        action: "STATUS_CHANGE",
        oldValue: "ASSIGNED",
        newValue: "IN_PROGRESS",
        reason: "Staff accepted the complaint.",
        actorId: staffId,
      }
    });

    // Notify Student
    await tx.notification.create({
      data: {
        title: "Work Started",
        message: `Your complaint ${complaint.title} has been accepted and work has started.`,
        type: "COMPLAINT_ACCEPTED",
        recipientId: complaint.raisedById,
        complaintId,
      }
    });

    // Notify Wardens (assuming all active wardens get it, or just generic logic)
    const wardens = await tx.user.findMany({ where: { role: "WARDEN", isActive: true } });
    const wardenNotifications = wardens.map(w => ({
      title: "Complaint Accepted",
      message: `Staff has started work on complaint ${complaint.title}.`,
      type: "COMPLAINT_ACCEPTED",
      recipientId: w.id,
      complaintId,
    }));
    if (wardenNotifications.length > 0) {
      await tx.notification.createMany({ data: wardenNotifications });
    }

    return res;
  }, { maxWait: 5000, timeout: 15000 });

  return updated;
};

export const updateProgress = async (staffId, complaintId, message) => {
  const complaint = await prisma.complaint.findUnique({
    where: { id: complaintId, assignedToId: staffId }
  });

  if (!complaint) throw new AppError("Complaint not found or not assigned to you.", 404);
  if (complaint.status !== "IN_PROGRESS") throw new AppError("Can only update progress for complaints in progress.", 400);

  const updated = await prisma.$transaction(async (tx) => {
    await tx.complaintHistory.create({
      data: {
        complaintId,
        action: "PROGRESS_UPDATE",
        reason: message,
        actorId: staffId,
      }
    });

    // Notify Student
    await tx.notification.create({
      data: {
        title: "Progress Updated",
        message: `Progress update on your complaint ${complaint.title}: ${message}`,
        type: "PROGRESS_UPDATED",
        recipientId: complaint.raisedById,
        complaintId,
      }
    });

    return tx.complaint.findUnique({
      where: { id: complaintId },
      select: COMPLAINT_SELECT,
    });
  }, { maxWait: 5000, timeout: 15000 });

  return updated;
};

export const resolveComplaint = async (staffId, complaintId, notes, file) => {
  const complaint = await prisma.complaint.findUnique({
    where: { id: complaintId, assignedToId: staffId }
  });

  if (!complaint) throw new AppError("Complaint not found or not assigned to you.", 404);
  if (complaint.status !== "IN_PROGRESS") throw new AppError("Can only resolve complaints that are in progress.", 400);

  let resolutionImageUrl = null;
  if (file) {
    try {
      const { url } = await uploadToCloudinary(file.path, "campusresolve/resolutions");
      resolutionImageUrl = url;
    } catch (err) {
      throw new AppError(`Failed to upload resolution image: ${err.message}`, 500);
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    const res = await tx.complaint.update({
      where: { id: complaintId },
      data: {
        status: "RESOLVED",
        resolvedAt: new Date(),
        resolutionNotes: notes,
        resolutionImage: resolutionImageUrl,
      },
      select: COMPLAINT_SELECT,
    });

    await tx.complaintHistory.create({
      data: {
        complaintId,
        action: "STATUS_CHANGE",
        oldValue: "IN_PROGRESS",
        newValue: "RESOLVED",
        reason: notes,
        actorId: staffId,
      }
    });

    // Notify Student
    await tx.notification.create({
      data: {
        title: "Complaint Resolved",
        message: `Your complaint ${complaint.title} has been marked as resolved by staff. Please verify.`,
        type: "COMPLAINT_RESOLVED",
        recipientId: complaint.raisedById,
        complaintId,
      }
    });

    // Notify Wardens
    const wardens = await tx.user.findMany({ where: { role: "WARDEN", isActive: true } });
    if (wardens.length > 0) {
      await tx.notification.createMany({
        data: wardens.map(w => ({
          title: "Complaint Resolved",
          message: `Complaint ${complaint.title} has been resolved.`,
          type: "COMPLAINT_RESOLVED",
          recipientId: w.id,
          complaintId,
        }))
      });
    }

    return res;
  }, { maxWait: 5000, timeout: 15000 });

  return updated;
};



export const getNotifications = async (staffId) => {
  return prisma.notification.findMany({
    where: { recipientId: staffId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
};

export const markNotificationsRead = async (staffId) => {
  await prisma.notification.updateMany({
    where: { recipientId: staffId, isRead: false },
    data: { isRead: true },
  });
};
