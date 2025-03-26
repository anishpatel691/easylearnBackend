import Payment from '../Models/Payment.model.js';
import Enrollment from '../Models/Enrollment.model.js';
import Course from '../Models/course.model.js';
import User from '../Models/user.model.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

// Initialize Razorpay with your key and secret
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_YQQ49rfvPKvQhv',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'Your_Razorpay_Secret_Key'
});

// Configure nodemailer with email service credentials
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_APP_PASSWORD || 'your-email-password'
  }
});

// Function to send enrollment success email
const sendEnrollmentEmail = async (userId, courseId) => {
  try {
    // Get user and course details
    const user = await User.findById(userId);
    const course = await Course.findById(courseId);
    
    if (!user || !course) {
      console.error('User or course not found for email notification');
      return;
    }
    
    // Create email content
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: user.email,
      subject: `Successfully Enrolled in ${course.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #4CAF50; text-align: center;">Enrollment Successful!</h2>
          <p>Hello ${user.name || user.username},</p>
          <p>Congratulations! You have successfully enrolled in <strong>${course.title}</strong>.</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Course Details:</h3>
            <p><strong>Course:</strong> ${course.title}</p>
            <p><strong>Instructor:</strong> ${course.instructorName || 'Course Instructor'}</p>
            <p><strong>Enrollment Date:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p>You can access your course materials by logging into your account and navigating to "My Courses" section.</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.WEBSITE_URL || 'https://yourwebsite.com'}/courses/my-courses" 
               style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Go to My Courses
            </a>
          </div>
          <p style="margin-top: 30px;">Happy learning!</p>
          <p>Best regards,<br>The Education Team</p>
        </div>
      `
    };
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Enrollment confirmation email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending enrollment email:', error);
    return false;
  }
};

// Create a new order for payment
export const createOrder = async (req, res) => {
  try {
    const { courseId, amount, userId,instructorId } = req.body;
    console.log("cid", courseId);
    console.log("amount", amount);
    console.log("uid", userId);

    if (!courseId || !amount || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // Check if the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    // Check if user is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      userId,
      courseId,
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course',
      });
    }

    // Generate a short receipt (Max length: 40 characters)
    const shortReceipt = `order_${userId}_${Date.now()}`.substring(0, 40);

    // Create Razorpay order
    const options = {
      amount: amount, // Amount in the smallest currency unit (paise)
      currency: "INR",
      receipt: shortReceipt,
      notes: {
        courseId: courseId,
        userId: userId,
      },
    };

    const order = await razorpay.orders.create(options);

    // Save order details in the database
    const payment = new Payment({
      userId,
      courseId,
      instructorId,
      orderId: order.id,
      amount: amount / 100, // Convert back to rupees for storage
      status: 'created',
    });

    await payment.save();

    return res.status(200).json({
      success: true,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message,
    });
  }
};

// Verify payment after Razorpay callback
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, courseId, userId,instructorId } = req.body;
    console.log("Instructerid",instructorId);
    
    // Retrieve the payment record
    const payment = await Payment.findOne({ orderId: razorpay_order_id });
    
    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment record not found' 
      });
    }

    // Update payment record
    payment.paymentId = razorpay_payment_id;
    payment.status = 'completed';
    await payment.save();

    // Create enrollment record
    const enrollment = new Enrollment({
      userId,
      courseId,
      instructorId,
      paymentId: payment._id,
      status: 'active'
    });

    await enrollment.save();

    // Send enrollment confirmation email
    await sendEnrollmentEmail(userId, courseId);

    return res.status(200).json({
      success: true,
      message: 'Payment verified and enrollment created successfully'
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to verify payment', 
      error: error.message 
    });
  }
};

// Enroll user in a free course
export const enrollFree = async (req, res) => {
  try {
    const { courseId, userId,instructorId } = req.body;

    // Check if the course is actually free
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }

    if (course.price !== 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'This is not a free course' 
      });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({ userId, courseId });
    if (existingEnrollment) {
      return res.status(400).json({ 
        success: false, 
        message: 'You are already enrolled in this course' 
      });
    }

    // Create a payment record for tracking
    const payment = new Payment({
      userId,
      courseId,
      instructorId,
      orderId: `free_${courseId}_${userId}_${Date.now()}`,
      amount: 0,
      status: 'completed',
      paymentMethod: 'free'
    });

    await payment.save();

    // Create enrollment
    const enrollment = new Enrollment({
      userId,
      courseId,
      paymentId: payment._id,
      instructorId,
      status: 'active'
    });

    await enrollment.save();

    // Send enrollment confirmation email
    await sendEnrollmentEmail(userId, courseId);

    return res.status(200).json({
      success: true,
      message: 'Successfully enrolled in free course'
    });
  } catch (error) {
    console.error('Error enrolling in free course:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to enroll in course', 
      error: error.message 
    });
  }
};

// Check enrollment status
export const checkEnrollmentStatus = async (req, res) => {
  try {
    const { courseId, userId } = req.params;
    
    const enrollment = await Enrollment.findOne({ userId, courseId });
    
    return res.status(200).json({
      enrolled: !!enrollment,
      status: enrollment ? enrollment.status : null
    });
  } catch (error) {
    console.error('Error checking enrollment status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check enrollment status', 
      error: error.message 
    });
  }
};

// Get all enrollments for a user
  export const getUserEnrollments = async (req, res) => {
    try {
      const { userId } = req.params;
      
      const enrollments = await Enrollment.find({ userId })
        .populate({
          path: 'courseId',
          select: 'title thumbnail description instructorId',
          populate: {
            path: 'instructorId',
            model: 'Instructor', // replace with your actual instructor model name
            select: 'name' // select only the name field from the instructor
          }
        })
        .sort({ enrollmentDate: -1 });
      
      console.log("data", enrollments);
      
      return res.status(200).json(enrollments);
    } catch (error) {
      console.error('Error fetching user enrollments:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch enrollments',
        error: error.message
      });
    }
  };

  export const getEnrollmentUser = async (req, res) => {
    try {
      const { instructorId } = req.params; // Corrected typo in parameter name
  
      const  enrollUserData = await Enrollment.find({ instructorId: instructorId })
      // Corrected variable name and property
        .populate({
          path: 'userId',
          select: 'name email',
        }).populate({ path: 'courseId',
          select: 'title thumbnail description instructorId'})
        .sort({ enrollmentDate: -1 });
  
      return res.status(200).json(enrollUserData);
  
    } catch (error) {
      console.error('Error fetching user enrollments:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch enrollments',
        error: error.message
      });
    }
  };


  
  export const Totalrevenueintructerbyid = async (req, res) => {
    try {
      const { instructorId } = req.params; // Corrected typo in parameter name
  
      const  enrollUserData = await Enrollment.find({ instructorId: instructorId })
      // Corrected variable name and property
        .populate({
          path: 'paymentId',
          select: 'amount  status orderId userId',
        })
        .sort({ enrollmentDate: -1 });
  console.log(enrollUserData);
  
      return res.status(200).json(enrollUserData);
  
    } catch (error) {
      console.error('Error fetching user enrollments:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch enrollments',
        error: error.message
      });
    }
  };