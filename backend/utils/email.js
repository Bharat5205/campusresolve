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

// Create a reusable transporter instance
const createTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Use App Password for Gmail
    },
  });

const transporter = createTransporter();

/**
 * Core send function — all email senders delegate to this.
 *
 * @param {object} options - Nodemailer mail options
 * @returns {Promise<void>}
 */
const sendEmail = async (options) => {
  await transporter.sendMail({
    from: `"CampusResolve" <${process.env.EMAIL_USER}>`,
    ...options,
  });
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
