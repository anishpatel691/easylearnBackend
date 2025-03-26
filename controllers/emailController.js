// File: /api/controllers/emailController.js
import nodemailer from 'nodemailer';

// Configure your email transporter
// You should use environment variables for sensitive information in production
const transporter = nodemailer.createTransport({
  service: 'gmail', // or another service like 'hotmail', 'yahoo', etc.
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_APP_PASSWORD || 'your-app-password'
  }
});

// Welcome email template
const getWelcomeEmailTemplate = (name, userType) => {
  const platformName = "Courseling Platform";
  const loginLink = "https://yourwebsite.com/login";
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #3498db; text-align: center;">Welcome to ${platformName}!</h2>
      
      <p>Hello ${name},</p>
      
      <p>Thank you for registering with us as a <strong>${userType}</strong>. We're excited to have you join our learning community!</p>
      
      <p>Here's a summary of your account details:</p>
      <ul>
        <li><strong>Username:</strong> ${name}</li>
        <li><strong>Account Type:</strong> ${userType}</li>
      </ul>
      
      <p>With your new account, you can:</p>
      <ul>
        ${userType === 'student' ? `
          <li>Access a wide range of courses</li>
          <li>Track your learning progress</li>
          <li>Earn certificates</li>
          <li>Interact with instructors and peers</li>
        ` : `
          <li>Create and publish courses</li>
          <li>Manage your students</li>
          <li>Track student progress</li>
          <li>Receive feedback on your teaching</li>
        `}
      </ul>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${loginLink}" style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Your Dashboard</a>
      </div>
      
      <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
      
      <p>Best regards,<br>The ${platformName} Team</p>
      
      <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #777; text-align: center;">
        <p>This is an automated message, please do not reply to this email.</p>
      </div>
    </div>
  `;
};

// Send welcome email controller
export const sendWelcomeEmail = async (req, res) => {
  try {
    const { name, email, userType } = req.body;
    
    if (!name || !email || !userType) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: 'Welcome to Courseling Platform',
      html: getWelcomeEmailTemplate(name, userType)
    };
    
    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ success: true, message: 'Welcome email sent successfully' });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    res.status(500).json({ success: false, message: 'Failed to send welcome email' });
  }
};