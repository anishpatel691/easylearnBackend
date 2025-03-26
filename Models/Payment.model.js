import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  orderId: {
    type: String,
    required: true,
    unique: true, // Razorpay Order ID must be unique
  },
  paymentId: {
    type: String,
    default: null, // Allow null values initially
    unique: true, // Mark as unique
    sparse: true, // Allow multiple null values
  }, 
  instructorId :{
       type: mongoose.Schema.Types.ObjectId,
            ref: 'Instructor',
    },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['created', 'completed', 'failed'],
    default: 'created',
  },
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment; 