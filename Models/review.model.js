import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentId: {
    type: String,
    required: true,
    unique: true
  },
  orderId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['created', 'authorized', 'captured', 'refunded', 'failed'],
    required: true
  },
  paymentMethod: {
    type: String
  },
  paymentDetails: {
    type: Object
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Payment = mongoose.model('Payment', PaymentSchema);
export default Payment;