import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1. Create Order
export const createOrder = async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);

    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (course.price === 0) {
      return enrollFree(req, res);
    }

    const options = {
      amount: course.price * 100, // Razorpay works in paise
      currency: 'INR',
      receipt: `receipt_${courseId}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(201).json({
      success: true,
      order,
      course,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
};

// 2. Verify Payment
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = req.body;

    const sha = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const expectedSignature = sha.digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Invalid signature' });
    }

    const enrollment = new Enrollment({
      user: req.user.id,
      course: courseId,
      paymentId: razorpay_payment_id,
      status: 'completed',
    });

    await enrollment.save();

    res.status(200).json({ success: true, message: 'Payment verified, enrollment successful' });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying payment', error: error.message });
  }
};

// 3. Enroll for Free Courses
export const enrollFree = async (req, res) => {
  try {
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const alreadyEnrolled = await Enrollment.findOne({ user: req.user.id, course: courseId });
    if (alreadyEnrolled) return res.status(400).json({ message: 'Already enrolled' });

    const enrollment = new Enrollment({
      user: req.user.id,
      course: courseId,
      status: 'completed',
    });

    await enrollment.save();
    res.status(200).json({ success: true, message: 'Enrolled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error enrolling in free course', error: error.message });
  }
};

// 4. Check Enrollment Status
export const checkEnrollment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const isEnrolled = await Enrollment.findOne({ user: req.user.id, course: courseId });

    res.status(200).json({ enrolled: !!isEnrolled });
  } catch (error) {
    res.status(500).json({ message: 'Error checking enrollment', error: error.message });
  }
};

// 5. Get User Enrollments
export const getUserEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user.id }).populate('course');

    res.status(200).json(enrollments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching enrollments', error: error.message });
  }
};

// 6. Get Enrollment Users for a Course
export const getEnrollmentUsers = async (req, res) => {
  try {
    const { courseId } = req.params;
    const students = await Enrollment.find({ course: courseId }).populate('user', 'name email');

    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching enrolled users', error: error.message });
  }
};

// 7. Get Total Revenue for Instructor
export const getInstructorRevenue = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user.id });
    const courseIds = courses.map((course) => course._id);

    const revenue = await Enrollment.aggregate([
      { $match: { course: { $in: courseIds }, status: 'completed' } },
      { $lookup: { from: 'courses', localField: 'course', foreignField: '_id', as: 'course' } },
      { $unwind: '$course' },
      { $group: { _id: null, totalRevenue: { $sum: '$course.price' } } },
    ]);

    res.status(200).json({ totalRevenue: revenue[0]?.totalRevenue || 0 });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating revenue', error: error.message });
  }
};
