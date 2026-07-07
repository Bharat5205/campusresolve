require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function runAuditTests() {
  console.log("Starting CRUD & Integration Database Audit...\n");
  
  try {
    // -----------------------------------------------------
    // 1. REGISTRATION & LOGIN TEST
    // -----------------------------------------------------
    console.log("[TEST] User Registration & Login");
    const testEmail = `test_audit_${Date.now()}@campus.edu`;
    const plainPassword = "TestPassword123!";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    
    // Create Student User
    const newUser = await prisma.user.create({
      data: {
        name: "Audit Test Student",
        email: testEmail,
        password: hashedPassword,
        role: "STUDENT",
        rollNumber: `AUDIT-${Date.now()}`,
        department: "Computer Science",
        year: "2nd Year",
        hostel: "Block B",
        roomNumber: "201",
        phone: "1234567890",
        isVerified: true
      }
    });
    
    console.log(`  ✓ Created user: ${newUser.id}`);
    
    // Read & Verify Login (DB Lookup + Hash check)
    const fetchedUser = await prisma.user.findUnique({ where: { email: testEmail } });
    if (!fetchedUser) throw new Error("User not found after creation.");
    const isMatch = await bcrypt.compare(plainPassword, fetchedUser.password);
    if (!isMatch) throw new Error("Password hashing/verification failed.");
    console.log(`  ✓ Verified DB lookup and Password Hashing`);
    console.log(`  ✓ Role is confirmed as: ${fetchedUser.role}`);
    
    // Update Profile
    const updatedUser = await prisma.user.update({
      where: { id: newUser.id },
      data: { roomNumber: "202" }
    });
    console.log(`  ✓ Updated room number to: ${updatedUser.roomNumber}`);

    // -----------------------------------------------------
    // 2. COMPLAINTS & NOTIFICATIONS TEST
    // -----------------------------------------------------
    console.log("\n[TEST] Complaint & Notification Creation");
    
    // Create Complaint
    const testImageUrl = "https://res.cloudinary.com/demo/image/upload/sample.jpg";
    const newComplaint = await prisma.complaint.create({
      data: {
        title: "Test Audit Complaint",
        description: "This is a test complaint to verify DB integration.",
        category: "Electrical",
        location: "Block B - Room 202",
        priority: "HIGH",
        images: [testImageUrl],
        raisedById: newUser.id
      }
    });
    console.log(`  ✓ Created complaint: ${newComplaint.id}`);
    
    // Verify Image URL stored correctly
    if (newComplaint.images[0] !== testImageUrl) throw new Error("Cloudinary image URL not stored correctly.");
    console.log("  ✓ Cloudinary Mock URL accurately stored in Array");

    // Create Notification
    const newNotification = await prisma.notification.create({
      data: {
        title: "New Complaint Raised",
        message: "Your complaint has been submitted successfully.",
        type: "NEW_COMPLAINT",
        recipientId: newUser.id,
        complaintId: newComplaint.id
      }
    });
    console.log(`  ✓ Created notification: ${newNotification.id}`);

    // -----------------------------------------------------
    // 3. GOOGLE OAUTH SIMULATION
    // -----------------------------------------------------
    console.log("\n[TEST] Google OAuth Integration Logic");
    const googleEmail = `oauth_${Date.now()}@google.com`;
    const googleId = `G-${Date.now()}`;
    
    const oauthUser = await prisma.user.upsert({
      where: { email: googleEmail },
      update: { googleId }, // Existing user logs in
      create: {             // New user inserted
        name: "Google Audit User",
        email: googleEmail,
        googleId,
        isVerified: true
      }
    });
    console.log(`  ✓ OAuth upsert successful. User ID: ${oauthUser.id}`);
    if (!oauthUser.password) {
      console.log("  ✓ Confirmed password is null (as expected for OAuth)");
    }

    // -----------------------------------------------------
    // 4. CLEANUP (DELETE TEST)
    // -----------------------------------------------------
    console.log("\n[TEST] Cascade Delete Operation");
    await prisma.user.delete({ where: { id: newUser.id } });
    
    const checkComplaint = await prisma.complaint.findUnique({ where: { id: newComplaint.id } });
    const checkNotification = await prisma.notification.findUnique({ where: { id: newNotification.id } });
    
    if (checkComplaint || checkNotification) {
      throw new Error("Cascade delete failed. Complaint or Notification still exists.");
    }
    console.log("  ✓ User deletion correctly cascaded to Complaints and Notifications.");
    
    // Cleanup OAuth user
    await prisma.user.delete({ where: { id: oauthUser.id } });

    console.log("\n✅ ALL CRUD & INTEGRATION TESTS PASSED SUCCESSFULLY");

  } catch (error) {
    console.error("\n❌ TEST FAILED:", error);
  } finally {
    await prisma.$disconnect();
  }
}

runAuditTests();
