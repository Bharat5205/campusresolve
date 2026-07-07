/**
 * utils/email.js
 * ---------------
 * Reusable Nodemailer email utility.
 *
 * Creates a reusable transporter and exports typed email senders.
 * All outgoing emails (OTP, notifications) go through this module.
 *
 * In production, replace Gmail SMTP with a transactional email
 * service (SendGrid, SES, Mailgun) by only changing the transporter config.
 */

import nodemailer from "nodemailer";

// Create a reusable transporter instance using generic SMTP credentials
// Recommended for production (Brevo, SendGrid, etc.) over Gmail SMTP.
const createTransporter = () => {
  const host = process.env.SMTP_HOST || "smtp-relay.brevo.com";
  const port = parseInt(process.env.SMTP_PORT, 10) || 587;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  
  console.log("[EmailService] Configuring SMTP Transporter with:");
  console.log(`- HOST: ${host}`);
  console.log(`- PORT: ${port}`);
  console.log(`- USER exists: ${!!user}`);
  console.log(`- PASS exists: ${!!pass}`);
  
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for 587/2525
    auth: {
      user,
      pass,
    },
    // Sometimes Render requires TLS rejectUnauthorized: false for internal proxies
    // but typically Brevo provides a valid cert.
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === "production" ? true : false,
    },
    // Production-safe SMTP timeouts (60 seconds)
    connectionTimeout: 60000,
    greetingTimeout: 60000,
    socketTimeout: 60000,
  });
};

const transporter = createTransporter();

/**
 * Core send function — all email senders delegate to this.
 *
 * @param {object} options - Nodemailer mail options
 * @returns {Promise<void>}
 */
const sendEmail = async (options) => {
  try {
    console.log(`[EmailService] Attempting to connect to SMTP server...`);
    
    // Verify connection configuration before sending
    await transporter.verify();
    console.log(`[EmailService] SMTP connection verified successfully.`);
    
    console.log(`[EmailService] Starting to send email to: ${options.to}`);
    
    // Await the sendMail promise directly without artificial race timeouts
    const senderEmail = process.env.SMTP_USER || process.env.EMAIL_USER || "noreply@campusresolve.com";
    const info = await transporter.sendMail({
      from: `"CampusResolve" <${senderEmail}>`,
      ...options,
    });

    console.log(`[EmailService] Email sent successfully to: ${options.to}. Message ID: ${info.messageId}`);
  } catch (error) {
    console.error(`[EmailService] SMTP Error encountered while sending email to ${options.to}:`, error);
    // Throw a generic error to prevent exposing internal SMTP details to the client
    throw new Error("Failed to dispatch email due to a network or configuration issue. Please try again later.");
  }
};

/**
 * Sends a password reset OTP email.
 *
 * @param {string} to   - Recipient email address
 * @param {string} otp  - 6-digit OTP string
 * @param {string} name - Recipient's name
 */
export const sendOTPEmail = async (to, otp, name) => {
  await sendEmail({
    to,
    subject: "CampusResolve - Password Reset OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Password Reset Request</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your password reset OTP is:</p>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #4f46e5;">${otp}</span>
        </div>
        <p>This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
        <p style="color: #6b7280; font-size: 12px;">If you did not request a password reset, please ignore this email.</p>
      </div>
    `,
  });
};

/**
 * Sends a welcome/account verification email.
 *
 * @param {string} to   - Recipient email address
 * @param {string} name - Recipient's name
 */
export const sendWelcomeEmail = async (to, name) => {
  await sendEmail({
    to,
    subject: "Welcome to CampusResolve",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5;">Welcome to CampusResolve 🎓</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your account has been created successfully. You can now log in and start raising or managing complaints.</p>
        <p style="color: #6b7280; font-size: 12px;">If you have any issues, contact your warden.</p>
      </div>
    `,
  });
};

/**
 * Sends a password reset success confirmation email.
 *
 * @param {string} to   - Recipient email address
 * @param {string} name - Recipient's name
 */
export const sendPasswordResetSuccessEmail = async (to, name) => {
  await sendEmail({
    to,
    subject: "CampusResolve - Password Changed Successfully",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Password Reset Successful</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your password has been changed successfully. You can now log in using your new password.</p>
        <p>If you did not make this change, please contact the campus administrator or hostel warden immediately.</p>
        <p style="color: #6b7280; font-size: 12px;">This is an automated notification. Please do not reply to this email.</p>
      </div>
    `,
  });
};

export default sendEmail;
