/**
 * routes/index.js
 * ----------------
 * Central API router — mounts all feature route modules.
 *
 * Convention: All routes are prefixed with /api (set in app.js).
 * Each feature module is mounted under its own sub-path.
 *
 * Adding a new feature:
 *   1. Create routes/<feature>.routes.js
 *   2. Import and mount it here
 */

import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import complaintRoutes from "./complaint.routes.js";
import notificationRoutes from "./notification.routes.js";
import wardenRoutes from "./warden.routes.js";
import staffRoutes from "./staff.routes.js";


const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/complaints", complaintRoutes);
router.use("/notifications", notificationRoutes);
router.use("/warden", wardenRoutes);
router.use("/staff", staffRoutes);


export default router;
