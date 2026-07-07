/**
 * services/warden.service.js
 * ----------------------------
 * Business logic for the Warden module.
 */

import prisma from "../config/database.js";
import { AppError } from "../utils/AppError.js";
import bcrypt from "bcryptjs";
import sendEmail from "../utils/email.js";

const SAFE_USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  profileImage: true,
  phone: true,
  department: true,
  isActive: true,
  isVerified: true,
  createdAt: true,
};

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
  cancelReason: true,
  isReopened: true,
  reopenReason: true,
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
  histories: {
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      action: true,
      oldValue: true,
      newValue: true,
      reason: true,
      createdAt: true,
      actor: { select: { id: true, name: true, role: true } },
    }
  }
};

// ── Dashboard & Analytics ──────────────────────────────────────────────────

export const getDashboardStats = async () => {
  const [
    totalComplaints,
    pending,
    assigned,
    inProgress,
    resolved,
    closed,
    recentComplaints,
    categoryGroup,
    statusGroup
  ] = await Promise.all([
    prisma.complaint.count(),
    prisma.complaint.count({ where: { status: "PENDING" } }),
    prisma.complaint.count({ where: { status: "ASSIGNED" } }),
    prisma.complaint.count({ where: { status: "IN_PROGRESS" } }),
    prisma.complaint.count({ where: { status: "RESOLVED" } }),
    prisma.complaint.count({ where: { status: "CLOSED" } }),
    prisma.complaint.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        raisedBy: { select: { name: true, hostel: true, roomNumber: true } }
      }
    }),
    prisma.complaint.groupBy({ by: ["category"], _count: { id: true } }),
    prisma.complaint.groupBy({ by: ["status"], _count: { id: true } }),
  ]);

  return {
    kpis: {
      total: totalComplaints,
      pending,
      assigned,
      inProgress,
      resolved,
      closed,
    },
    charts: {
      categoryDistribution: categoryGroup.map(g => ({ name: g.category, value: g._count.id })),
      statusDistribution: statusGroup.map(g => ({ name: g.status, value: g._count.id })),
    },
    recentComplaints: recentComplaints.map(c => ({
      id: c.id,
      title: c.title,
      category: c.category,
      priority: c.priority,
      status: c.status,
      student: c.raisedBy.name,
      hostel: c.raisedBy.hostel,
      roomNumber: c.raisedBy.roomNumber,
      createdAt: c.createdAt
    }))
  };
};

// ── Complaint Management ───────────────────────────────────────────────────

export const getComplaints = async (query = {}) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where = {};
  if (query.status) where.status = query.status;
  if (query.priority) where.priority = query.priority;
  if (query.category) where.category = { contains: query.category, mode: "insensitive" };
  if (query.assignedToId) where.assignedToId = query.assignedToId;

  // Search by Ticket ID or Student Name
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

export const getComplaintById = async (id) => {
  const complaint = await prisma.complaint.findUnique({
    where: { id },
    select: COMPLAINT_SELECT,
  });

  if (!complaint) throw new AppError("Complaint not found.", 404);
  return complaint;
};

export const assignComplaint = async (complaintId, staffId, wardenId) => {
  const [complaint, staff] = await Promise.all([
    prisma.complaint.findUnique({ where: { id: complaintId } }),
    prisma.user.findUnique({ where: { id: staffId, role: "STAFF" } }),
  ]);

  if (!complaint) throw new AppError("Complaint not found.", 404);
  if (!staff) throw new AppError("Staff member not found.", 404);
  if (!staff.isActive) throw new AppError("Cannot assign to inactive staff.", 400);

  const updated = await prisma.$transaction(async (tx) => {
    const res = await tx.complaint.update({
      where: { id: complaintId },
      data: {
        assignedToId: staffId,
        status: "ASSIGNED",
        assignedAt: new Date(),
      },
      select: COMPLAINT_SELECT,
    });

    await tx.complaintHistory.create({
      data: {
        complaintId,
        action: "ASSIGNED",
        oldValue: complaint.assignedToId,
        newValue: staffId,
        actorId: wardenId,
      }
    });

    // Create Notification for Staff
    await tx.notification.create({
      data: {
        title: "New Assignment",
        message: `You have been assigned a new complaint: ${complaint.title}`,
        type: "COMPLAINT_ASSIGNED",
        recipientId: staffId,
        complaintId,
      }
    });

    return res;
  }, { maxWait: 5000, timeout: 15000 });

  return updated;
};

export const updateComplaintStatus = async (complaintId, body, wardenId) => {
  const complaint = await prisma.complaint.findUnique({ where: { id: complaintId } });
  if (!complaint) throw new AppError("Complaint not found.", 404);

  const data = { status: body.status };
  if (body.remarks) data.remarks = body.remarks;

  const updated = await prisma.$transaction(async (tx) => {
    const res = await tx.complaint.update({
      where: { id: complaintId },
      data,
      select: COMPLAINT_SELECT,
    });

    await tx.complaintHistory.create({
      data: {
        complaintId,
        action: "STATUS_CHANGE",
        oldValue: complaint.status,
        newValue: body.status,
        actorId: wardenId,
        reason: body.remarks,
      }
    });

    return res;
  }, { maxWait: 5000, timeout: 15000 });

  return updated;
};

export const updateComplaintPriority = async (complaintId, body, wardenId) => {
  const complaint = await prisma.complaint.findUnique({ where: { id: complaintId } });
  if (!complaint) throw new AppError("Complaint not found.", 404);

  const updated = await prisma.$transaction(async (tx) => {
    const res = await tx.complaint.update({
      where: { id: complaintId },
      data: { priority: body.priority },
      select: COMPLAINT_SELECT,
    });

    await tx.complaintHistory.create({
      data: {
        complaintId,
        action: "PRIORITY_CHANGE",
        oldValue: complaint.priority,
        newValue: body.priority,
        actorId: wardenId,
      }
    });

    return res;
  }, { maxWait: 5000, timeout: 15000 });

  return updated;
};

export const cancelComplaint = async (complaintId, reason, wardenId) => {
  const complaint = await prisma.complaint.findUnique({ where: { id: complaintId } });
  if (!complaint) throw new AppError("Complaint not found.", 404);
  if (complaint.status === "RESOLVED" || complaint.status === "CLOSED") {
    throw new AppError("Cannot cancel a resolved or closed complaint.", 400);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const res = await tx.complaint.update({
      where: { id: complaintId },
      data: {
        status: "CANCELLED",
        cancelReason: reason,
      },
      select: COMPLAINT_SELECT,
    });

    await tx.complaintHistory.create({
      data: {
        complaintId,
        action: "CANCELLED",
        oldValue: complaint.status,
        newValue: "CANCELLED",
        reason,
        actorId: wardenId,
      }
    });

    // Notify Student
    await tx.notification.create({
      data: {
        title: "Complaint Cancelled",
        message: `Your complaint ${complaint.title} has been cancelled. Reason: ${reason}`,
        type: "COMPLAINT_CANCELLED",
        recipientId: complaint.raisedById,
        complaintId,
      }
    });

    return res;
  }, { maxWait: 5000, timeout: 15000 });

  return updated;
};

// ── Staff Management ───────────────────────────────────────────────────────

export const getStaff = async (query = {}) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  const where = { role: "STAFF" };
  if (query.search) {
    where.name = { contains: query.search, mode: "insensitive" };
  }

  const [staff, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: {
        ...SAFE_USER_SELECT,
        _count: {
          select: {
            assignedComplaints: true,
          }
        },
        assignedComplaints: {
          select: { status: true },
        }
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  // Map performance metrics
  const staffWithStats = staff.map(s => {
    const totalAssigned = s._count.assignedComplaints;
    const completed = s.assignedComplaints.filter(c => c.status === "RESOLVED" || c.status === "CLOSED").length;
    const pending = totalAssigned - completed;
    
    // Removing assignedComplaints from final response to save bandwidth
    const { assignedComplaints, ...rest } = s;
    return {
      ...rest,
      stats: {
        assigned: totalAssigned,
        completed,
        pending,
        completionRate: totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0,
      }
    };
  });

  return {
    data: staffWithStats,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const createStaff = async (data) => {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new AppError("User with this email already exists.", 400);

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const staff = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      department: data.department,
      password: hashedPassword,
      role: "STAFF",
      isVerified: true, // Auto-verified since Warden creates them
    },
    select: SAFE_USER_SELECT,
  });

  // Send Welcome Email
  try {
    const subject = "Welcome to CampusResolve - Staff Account Created";
    const text = `Hello ${staff.name},\n\nYour staff account has been created successfully.\n\nEmail: ${staff.email}\nPassword: ${data.password}\n\nPlease login and change your password immediately.`;
    await sendEmail({ to: staff.email, subject, text });
  } catch (err) {
    // Non-fatal error, staff is created
  }

  return staff;
};

export const updateStaff = async (staffId, data) => {
  const staff = await prisma.user.findUnique({ where: { id: staffId, role: "STAFF" } });
  if (!staff) throw new AppError("Staff not found.", 404);

  return prisma.user.update({
    where: { id: staffId },
    data: {
      phone: data.phone,
      department: data.department,
    },
    select: SAFE_USER_SELECT,
  });
};

export const deactivateStaff = async (staffId, isActive) => {
  const staff = await prisma.user.findUnique({ where: { id: staffId, role: "STAFF" } });
  if (!staff) throw new AppError("Staff not found.", 404);

  return prisma.user.update({
    where: { id: staffId },
    data: { isActive },
    select: SAFE_USER_SELECT,
  });
};

// ── Notifications ──────────────────────────────────────────────────────────

export const getNotifications = async (userId) => {
  return prisma.notification.findMany({
    where: { recipientId: userId },
    orderBy: { createdAt: "desc" },
    take: 50, // Keep it reasonable
  });
};

export const markNotificationsRead = async (userId) => {
  await prisma.notification.updateMany({
    where: { recipientId: userId, isRead: false },
    data: { isRead: true },
  });
};
