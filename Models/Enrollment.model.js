import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
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
  instructorId :{
     type: mongoose.Schema.Types.ObjectId,
          ref: 'Instructor',
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'expired'],
    default: 'active'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completedLectures: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lecture'
  }]
}, { timestamps: true });

// Create a compound index to ensure a user can only enroll once per course
enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

export default Enrollment;