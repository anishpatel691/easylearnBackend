
import OTP from '../Models/otp.js';
import User from '../Models/user.model.js';
import Instructor from '../Models/Instructor.model.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({
    path: './.env'
});

// Create reusable transporter object using environment variables
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
    },
});

/**
 * Reset password after OTP verification
 */
export const resetPassword = async (req, res) => {
    const { email, otp, password } = req.body;
    
    try {
        // Validate input
        if (!email || !otp || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Email, verification code, and new password are required" 
            });
        }
        
        // Find OTP record
        const otpRecord = await OTP.findOne({ email });
        
        // Check if OTP exists and is not expired
        if (!otpRecord) {
            return res.status(400).json({ 
                success: false, 
                message: "No verification code found for this email" 
            });
        }
        
        if (otpRecord.expiresAt < new Date()) {
            await OTP.deleteOne({ email });
            return res.status(400).json({ 
                success: false, 
                message: "Verification code has expired" 
            });
        }
        
        // Verify OTP
        if (otpRecord.otp !== otp) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid verification code" 
            });
        }
        
        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Update password by checking both collections
let userUpdated = null;

// First, try to find and update in the User collection
userUpdated = await User.findOneAndUpdate(
    { email },
    { password: password },
    { new: true }
);

// If not found in User collection, try the Instructor collection
if (!userUpdated) {
    userUpdated = await Instructor.findOneAndUpdate(
        { email },
        { password: password },
        { new: true }
    );
}

// If user not found in either collection
if (!userUpdated) {
    return res.status(404).json({
        success: false,
        message: "No account found with this email"
    });
}
        
        // Delete OTP record after successful password reset
        await OTP.deleteOne({ email });
        
        // Create HTML email content for password reset confirmation
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                <div style="background-color: #4a90e2; padding: 15px; text-align: center; border-radius: 3px 3px 0 0;">
                    <h1 style="color: white; margin: 0;">Counselling Platform</h1>
                </div>
                <div style="padding: 20px; background-color: #f9f9f9;">
                    <h2 style="color: #333; margin-top: 0;">Password Reset Successful</h2>
                    <p style="font-size: 16px; color: #555;">Your password has been successfully reset.</p>
                    <p style="font-size: 14px; color: #777;">If you did not request this change, please contact support immediately.</p>
                </div>
                <div style="padding: 15px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #e0e0e0;">
                    <p>© ${new Date().getFullYear()} Counselling Platform. All rights reserved.</p>
                </div>
            </div>
        `;
        
        // Send confirmation email
        try {
            await transporter.sendMail({
                from: `"Counselling Platform" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: "Password Reset Successful",
                text: `Your password has been successfully reset. If you did not request this change, please contact support immediately.`,
                html: htmlContent,
            });
        } catch (emailError) {
            console.error("Email sending error:", emailError);
            // Don't return an error here, as the password reset was successful
            // Just log the email error
        }
        
        res.json({ 
            success: true, 
            message: "Password reset successfully" 
        });
    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error resetting password", 
            error: error.message 
        });
    }
};
/**
 * Generate and send OTP via email
 */export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate email
    if (!email) {
        return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Generate a 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    
    // Set expiration time (10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    // First, try to find user in the User collection
    let userFound = await User.findOne({ email });
    
    // If not found in User collection, try the Instructor collection
    if (!userFound) {
        userFound = await Instructor.findOne({ email });
    }
    
    // If user not found in either collection
    if (!userFound) {
        return res.status(404).json({
            success: false,
            message: "No account found with this email"
        });
    }
    
    // Update or create OTP record
    try {
        await OTP.findOneAndUpdate(
            { email },
            { 
                email,
                otp, 
                expiresAt,
                },
            { upsert: true, new: true }
        );
    } catch (dbError) {
        console.error("Database error:", dbError);
        return res.status(500).json({ 
            success: false, 
            message: "Failed to store OTP in database", 
            error: dbError.message 
        });
    }
    
    // Create HTML email content
    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <div style="background-color: #4a90e2; padding: 15px; text-align: center; border-radius: 3px 3px 0 0;">
                <h1 style="color: white; margin: 0;">Counselling Platform</h1>
            </div>
            <div style="padding: 20px; background-color: #f9f9f9;">
                <h2 style="color: #333; margin-top: 0;">Your Verification Code</h2>
                <p style="font-size: 16px; color: #555;">Please use the following code to verify your account:</p>
                <div style="background-color: #edf2f7; padding: 15px; border-radius: 4px; text-align: center; margin: 20px 0;">
                    <span style="font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #333;">${otp}</span>
                </div>
                <p style="font-size: 14px; color: #777;">This code will expire in 10 minutes.</p>
                <p style="font-size: 14px; color: #777;">If you didn't request this code, please ignore this email.</p>
            </div>
            <div style="padding: 15px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #e0e0e0;">
                <p>© ${new Date().getFullYear()} Counselling Platform. All rights reserved.</p>
            </div>
        </div>
    `;
    
    // Send email
    try {
        await transporter.sendMail({
            from: `"Counselling Platform" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Your Verification Code",
            text: `Your verification code is: ${otp}. It expires in 10 minutes.`,
            html: htmlContent,
        });
        
        return res.status(200).json({ 
            success: true, 
            message: "Verification code sent successfully" 
        });
    } catch (emailError) {
        console.error("Email sending error:", emailError);
        return res.status(500).json({ 
            success: false, 
            message: "Failed to send email", 
            error: emailError.message 
        });
    }
} catch (error) {
    console.error("General error in sendOTP:", error);
    return res.status(500).json({ 
        success: false, 
        message: "Error generating and sending verification code", 
        error: error.message 
    });
}
};
/**
 * Verify OTP
 */
export const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;
    
    try {
        // Validate input
        if (!email || !otp) {
            return res.status(400).json({ 
                success: false, 
                message: "Email and verification code are required" 
            });
        }
        
        // Find OTP record
        const otpRecord = await OTP.findOne({ email });
        
        // Check if OTP exists and is not expired
        if (!otpRecord) {
            return res.status(400).json({ 
                success: false, 
                message: "No verification code found for this email" 
            });
        }
        
        if (otpRecord.expiresAt < new Date()) {
            await OTP.deleteOne({ email });
            return res.status(400).json({ 
                success: false, 
                message: "Verification code has expired" 
            });
        }
        
        // Verify OTP
        if (otpRecord.otp !== otp) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid verification code" 
            });
        }
        
        // Delete OTP record after successful verification
        await OTP.deleteOne({ email });
        
        res.json({ 
            success: true, 
            message: "Email verified successfully" 
        });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error verifying email", 
            error: error.message 
        });
    }
};