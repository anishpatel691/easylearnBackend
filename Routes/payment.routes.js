import express from 'express';
import { 
  createOrder, 
  verifyPayment, 
  enrollFree, 
  checkEnrollmentStatus, 
  getUserEnrollments,
  getEnrollmentUser
} from '../controllers/payment.controller.js';
import { authenticateUser } from '../Midellwere/auth.js';

const router = express.Router();

// Create a new order for payment
router.post('/create-order', createOrder);

// Verify payment after Razorpay callback
router.post('/verify', verifyPayment);

// Enroll in a free course
router.post('/enroll-free',  enrollFree);

// Check enrollment status
router.get('/status/:courseId/:userId', checkEnrollmentStatus);

// Get all enrollments for a user
router.get('/enrollments/:userId',  getUserEnrollments);


export default router;