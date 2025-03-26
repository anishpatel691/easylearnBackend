import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Create transporter using environment variables
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD, // Use app password for Gmail
  },
  tls: {
    rejectUnauthorized: false // For development only - remove in production
  }
});

/**
 * Sends an OTP verification email to the user
 * @param {string} email - Recipient's email address
 * @param {string} otp - The one-time password
 * @param {number} expiryMinutes - Minutes until OTP expires
 * @returns {Promise<boolean>} - Success status
 */
export const sendOTP = async (email, otp, expiryMinutes = 10) => {
  try {
    // HTML version with better formatting
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>You requested a password reset. Use the following One-Time Password (OTP) to complete your request:</p>
        <div style="background-color: #f5f5f5; padding: 12px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This OTP will expire in <strong>${expiryMinutes} minutes</strong>.</p>
        <p>If you didn't request this password reset, please ignore this email or contact support.</p>
        <p style="font-size: 12px; color: #777; margin-top: 30px; text-align: center;">
          This is an automated message. Please do not reply directly to this email.
        </p>
      </div>
    `;

    const mailOptions = {
      from: `"Account Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Password Reset OTP',
      text: `Your OTP is: ${otp}. It will expire in ${expiryMinutes} minutes. If you didn't request this, please ignore this email.`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send OTP email');
  }
};

// Verify the email configuration on startup
(async function verifyEmailSetup() {
  try {
    await transporter.verify();
    console.log('Email server connection verified and ready to send emails');
  } catch (error) {
    console.error('Email server connection failed:', error);
  }
})();