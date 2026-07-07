require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

const BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, method = 'GET', token = null, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  
  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await res.json().catch(() => ({}));
  
  return { status: res.status, data };
}

async function runTests() {
  console.log("=== CampusResolve API Full Audit E2E Test ===\n");
  
  const studentEmail = `student_${Date.now()}@campus.edu`;
  const wardenEmail = `warden_${Date.now()}@campus.edu`;
  const staffEmail = `staff_${Date.now()}@campus.edu`;
  const password = "SecurePassword123!";
  const hashedPassword = await bcrypt.hash(password, 10);
  
  let studentToken = "";
  let wardenToken = "";
  let staffToken = "";
  
  let complaintId = "";

  try {
    // -----------------------------------------------------
    // SETUP: Seed Warden & Student
    // -----------------------------------------------------
    console.log("[SETUP] Seeding Data...");
    // 1. Register Student via API to test auth flow again just in case
    const regRes = await request('/auth/register', 'POST', null, {
      name: "Test Student", email: studentEmail, password, confirmPassword: password,
      rollNumber: `STU-${Date.now()}`, department: "CS", year: "1st Year",
      hostel: "Block A", roomNumber: "101", phone: "9876543210"
    });
    studentToken = regRes.data.data.accessToken;
    
    // 2. Insert Warden directly (since no public route exists to create a warden)
    await prisma.user.create({
      data: {
        name: "Test Warden", email: wardenEmail, password: hashedPassword,
        role: "WARDEN", department: "Hostel Admin", isActive: true, isVerified: true
      }
    });
    const wardenLogin = await request('/auth/login', 'POST', null, { email: wardenEmail, password });
    wardenToken = wardenLogin.data.data.accessToken;
    
    console.log("  ✓ Test Student & Warden created and authenticated.");

    // -----------------------------------------------------
    // MODULE 1: USERS & WARDEN (Staff Management)
    // -----------------------------------------------------
    console.log("\n[TEST] Warden API - Staff Management");
    
    // Create Staff
    const createStaffRes = await request('/warden/staff', 'POST', wardenToken, {
      name: "Test Staff", email: staffEmail, password,
      department: "Plumbing", phone: "1234567890"
    });
    if (createStaffRes.status !== 201) throw new Error("Warden failed to create staff: " + JSON.stringify(createStaffRes.data));
    console.log("  ✓ POST /api/warden/staff - Staff created successfully");

    // Login as Staff
    const staffLogin = await request('/auth/login', 'POST', null, { email: staffEmail, password });
    staffToken = staffLogin.data.data.accessToken;
    const staffId = staffLogin.data.data.user.id;
    console.log("  ✓ Staff authenticated");
    
    // Get all Staff (Warden)
    const getStaffRes = await request('/warden/staff', 'GET', wardenToken);
    if (getStaffRes.status !== 200 || !Array.isArray(getStaffRes.data.data)) throw new Error("Failed to fetch staff list");
    console.log("  ✓ GET /api/warden/staff - Fetched staff list successfully");

    // Update User Profile (Student)
    console.log("\n[TEST] Users API");
    const updateMeRes = await request('/users/me', 'PATCH', studentToken, { phone: "1112223333" });
    if (updateMeRes.status !== 200 || updateMeRes.data.data.phone !== "1112223333") throw new Error("Failed to update user profile");
    console.log("  ✓ PATCH /api/users/me - Profile updated successfully");

    // -----------------------------------------------------
    // MODULE 2: COMPLAINTS API
    // -----------------------------------------------------
    console.log("\n[TEST] Complaints API");
    
    // Student raises complaint
    const raiseRes = await request('/complaints', 'POST', studentToken, {
      title: "Leaky Pipe in Bathroom",
      description: "The sink pipe is leaking constantly and flooding the floor.",
      category: "Plumbing",
      priority: "HIGH",
      location: "Block A - Room 101"
    });
    if (raiseRes.status !== 201) throw new Error("Failed to raise complaint: " + JSON.stringify(raiseRes.data));
    complaintId = raiseRes.data.data.id;
    console.log("  ✓ POST /api/complaints - Complaint created successfully");

    // Student fetches own complaints
    const getMyComplaints = await request('/complaints', 'GET', studentToken);
    if (getMyComplaints.status !== 200 || getMyComplaints.data.data.length === 0) throw new Error("Failed to fetch student complaints");
    console.log("  ✓ GET /api/complaints (Student) - Fetched successfully");

    // Warden assigns complaint to Staff
    const assignRes = await request(`/complaints/${complaintId}/assign`, 'PATCH', wardenToken, { staffId });
    if (assignRes.status !== 200) throw new Error("Failed to assign complaint: " + JSON.stringify(assignRes.data));
    console.log("  ✓ PATCH /api/complaints/:id/assign (Warden) - Assigned successfully");

    // -----------------------------------------------------
    // MODULE 3: STAFF API
    // -----------------------------------------------------
    console.log("\n[TEST] Staff API");
    
    // Staff accepts complaint
    const acceptRes = await request(`/staff/complaints/${complaintId}/accept`, 'PUT', staffToken);
    if (acceptRes.status !== 200) throw new Error("Failed to accept complaint: " + JSON.stringify(acceptRes.data));
    console.log("  ✓ PUT /api/staff/complaints/:id/accept - Accepted successfully");
    
    // Staff updates progress
    const progressRes = await request(`/staff/complaints/${complaintId}/progress`, 'PUT', staffToken, {
      status: "IN_PROGRESS",
      progressMessage: "Purchased replacement pipe, working on it now."
    });
    if (progressRes.status !== 200) throw new Error("Failed to update progress: " + JSON.stringify(progressRes.data));
    console.log("  ✓ PUT /api/staff/complaints/:id/progress - Progress updated successfully");

    // -----------------------------------------------------
    // MODULE 4: NOTIFICATIONS API
    // -----------------------------------------------------
    console.log("\n[TEST] Notifications API");
    
    const notifRes = await request('/notifications', 'GET', studentToken);
    if (notifRes.status !== 200) throw new Error("Failed to fetch notifications");
    console.log(`  ✓ GET /api/notifications - Fetched ${notifRes.data.data.length} notifications successfully`);

    const readAllRes = await request('/notifications/read-all', 'PATCH', studentToken);
    if (readAllRes.status !== 200) throw new Error("Failed to mark notifications read");
    console.log("  ✓ PATCH /api/notifications/read-all - Marked read successfully");

    // -----------------------------------------------------
    // MODULE 5: WARDEN DASHBOARD API (Merged Analytics)
    // -----------------------------------------------------
    console.log("\n[TEST] Dashboard API");
    const dashboardRes = await request('/warden/dashboard', 'GET', wardenToken);
    if (dashboardRes.status !== 200) throw new Error("Failed to fetch dashboard data");
    console.log("  ✓ GET /api/warden/dashboard (Warden) - Fetched successfully");

    console.log("\n✅ ALL API MODULE TESTS PASSED SUCCESSFULLY");

  } catch (err) {
    console.error("\n❌ TEST FAILED:", err.message);
  } finally {
    console.log("\n[CLEANUP] Removing test data...");
    await prisma.user.deleteMany({
      where: { email: { in: [studentEmail, wardenEmail, staffEmail] } }
    });
    await prisma.$disconnect();
  }
}

runTests();
