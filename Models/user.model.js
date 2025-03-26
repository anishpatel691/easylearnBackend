import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
          /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
          'Please add a valid email'
        ]
      },
      password: {
        type: String,
        required: true
      },
      resetPasswordOtp: String,
      resetPasswordOtpExpires: Date,
    role: {
        type: String,
        enum: ['student', 'instructor'],
        default: 'student'
    },
    progress: [
        {
          lectureId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lecture'
          },
          courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
          },
          progress: {
            type: Number,
            default: 0
          },
          completed: {
            type: Boolean,
            default: false
          },
          lastPosition: {
            type: Number,
            default: 0
          },
          learningHours: {
            type: Number,
            default: 0
          },
}], 
    enrolledCourses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Course'
        }],
    createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
