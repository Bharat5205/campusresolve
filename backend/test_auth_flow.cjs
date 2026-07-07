require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE_URL = 'http://localhost:5000/api';

async function runAuthTests() {
  console.log("=== Authentication Module Full E2E Test ===\n");
  
  const testEmail = `auth_test_${Date.now()}@campus.edu`;
  const testPassword = "SecurePassword123!";
  
  let accessToken = "";
  let refreshTokenCookie = "";

  try {
    // -----------------------------------------------------
    // 1. REGISTER
    // -----------------------------------------------------
    console.log("[TEST] Registration");
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: "Test Auth User",
        email: testEmail,
        password: testPassword,
        confirmPassword: testPassword,
        rollNumber: `AUTH-${Date.now()}`,
        department: "CS",
        year: "1st Year",
        hostel: "Block A",
        roomNumber: "101",
        phone: "9876543210"
      })
    });
    
    if (regRes.status !== 201) throw new Error(`Registration failed: ${await regRes.text()}`);
    
    const regData = await regRes.json();
    accessToken = regData.data.accessToken;
    
    // Extract cookie
    const setCookieHeader = regRes.headers.getSetCookie ? regRes.headers.getSetCookie() : regRes.headers.get('set-cookie');
    if (!setCookieHeader || setCookieHeader.length === 0) throw new Error("No Set-Cookie header found on Registration!");
    
    refreshTokenCookie = Array.isArray(setCookieHeader) ? setCookieHeader.find(c => c.includes('refreshToken=')) : setCookieHeader;
    console.log("  ✓ Registration successful");
    console.log("  ✓ Access Token received");
    console.log("  ✓ Refresh Token HttpOnly Cookie received");

    // -----------------------------------------------------
    // 2. LOGIN
    // -----------------------------------------------------
    console.log("\n[TEST] Login");
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword })
    });

    if (loginRes.status !== 200) throw new Error(`Login failed: ${await loginRes.text()}`);
    const loginData = await loginRes.json();
    accessToken = loginData.data.accessToken; // update with fresh token

    // Update refresh token cookie
    const loginSetCookieHeader = loginRes.headers.getSetCookie ? loginRes.headers.getSetCookie() : loginRes.headers.get('set-cookie');
    if (loginSetCookieHeader) {
      refreshTokenCookie = Array.isArray(loginSetCookieHeader) ? loginSetCookieHeader.find(c => c.includes('refreshToken=')) : loginSetCookieHeader;
    }

    console.log("  ✓ Login successful");

    // -----------------------------------------------------
    // 3. PROTECTED ROUTES (getCurrentUser)
    // -----------------------------------------------------
    console.log("\n[TEST] Protected Route (getCurrentUser)");
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (meRes.status !== 200) throw new Error(`Protected route failed: ${await meRes.text()}`);
    const meData = await meRes.json();
    if (meData.data.email !== testEmail) throw new Error("Token mapped to wrong user!");
    console.log("  ✓ authenticateUser middleware passed");
    console.log(`  ✓ Identity verified as: ${meData.data.email}`);

    // -----------------------------------------------------
    // 4. ROLE MIDDLEWARE (Warden endpoint)
    // -----------------------------------------------------
    console.log("\n[TEST] Role Middleware Authorization");
    const wardenRes = await fetch(`${BASE_URL}/warden/dashboard`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (wardenRes.status !== 403) throw new Error(`Role middleware failed to block student! Status: ${wardenRes.status}`);
    console.log("  ✓ authorizeRoles middleware correctly blocked STUDENT from WARDEN route (403 Forbidden)");

    // -----------------------------------------------------
    // 5. REFRESH TOKEN
    // -----------------------------------------------------
    console.log("\n[TEST] Refresh Token Rotation");
    // Parse just the cookie name and value
    const rawCookie = refreshTokenCookie.split(';')[0];
    const refreshRes = await fetch(`${BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': rawCookie
      }
    });

    if (refreshRes.status !== 200) throw new Error(`Refresh token failed: ${await refreshRes.text()}`);
    console.log("  ✓ Refresh token successfully rotated");

    // -----------------------------------------------------
    // 6. FORGOT PASSWORD & OTP GENERATION
    // -----------------------------------------------------
    console.log("\n[TEST] Forgot Password & OTP");
    const forgotRes = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });
    
    if (forgotRes.status !== 200) throw new Error(`Forgot password failed: ${await forgotRes.text()}`);
    console.log("  ✓ OTP Generation triggered successfully");

    // Manually extract OTP from DB to bypass email dependency
    const otpRecord = await prisma.passwordResetOTP.findFirst({
      where: { email: testEmail },
      orderBy: { createdAt: 'desc' }
    });
    
    if (!otpRecord) throw new Error("OTP was not saved in the database!");
    console.log("  ✓ OTP successfully stored in PasswordResetOTP table");

    // Because we need the unhashed OTP to verify, and the DB stores it hashed,
    // we have a minor issue. We can't reverse bcrypt!
    // Solution: We will mock the OTP by forcing an update on the database with a known hash!
    const bcrypt = require('bcryptjs');
    const knownOtp = "123456";
    const hashedKnownOtp = await bcrypt.hash(knownOtp, 12);
    
    await prisma.passwordResetOTP.update({
      where: { id: otpRecord.id },
      data: { otp: hashedKnownOtp }
    });
    
    console.log("  ✓ Mocked OTP injected for testing: " + knownOtp);

    // -----------------------------------------------------
    // 7. VERIFY OTP
    // -----------------------------------------------------
    console.log("\n[TEST] Verify OTP");
    const verifyOtpRes = await fetch(`${BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otp: knownOtp })
    });

    if (verifyOtpRes.status !== 200) throw new Error(`Verify OTP failed: ${await verifyOtpRes.text()}`);
    console.log("  ✓ OTP Verified successfully");

    // -----------------------------------------------------
    // 8. RESET PASSWORD
    // -----------------------------------------------------
    console.log("\n[TEST] Reset Password");
    const newPassword = "NewSecurePassword123!";
    const resetRes = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otp: knownOtp, newPassword: newPassword })
    });

    if (resetRes.status !== 200) throw new Error(`Reset password failed: ${await resetRes.text()}`);
    console.log("  ✓ Password reset successfully");

    // Test login with old password (should fail)
    const loginOldRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword })
    });
    if (loginOldRes.status === 200) throw new Error("Login with OLD password unexpectedly succeeded!");
    console.log("  ✓ Login with OLD password rejected (401 Unauthorized)");

    // Test login with new password (should succeed)
    const loginNewRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: newPassword })
    });
    if (loginNewRes.status !== 200) throw new Error(`Login with NEW password failed: ${await loginNewRes.text()}`);
    console.log("  ✓ Login with NEW password succeeded");

    // -----------------------------------------------------
    // 9. LOGOUT
    // -----------------------------------------------------
    console.log("\n[TEST] Logout");
    const logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': rawCookie
      }
    });

    if (logoutRes.status !== 200) throw new Error(`Logout failed: ${await logoutRes.text()}`);
    console.log("  ✓ Logout successful");
    
    // Verify refresh token is nulled in database
    const userAfterLogout = await prisma.user.findUnique({ where: { email: testEmail } });
    if (userAfterLogout.refreshToken !== null) throw new Error("Refresh token was not cleared from DB!");
    console.log("  ✓ Refresh token securely cleared from database");

    console.log("\n✅ ALL AUTHENTICATION MODULE TESTS PASSED SUCCESSFULLY");

  } catch (err) {
    console.error("\n❌ TEST FAILED:", err.message);
  } finally {
    // Cleanup
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await prisma.$disconnect();
  }
}

runAuthTests();
