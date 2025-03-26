import mongoose from 'mongoose';

const instructorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    resetPasswordOtp: String,
    resetPasswordOtpExpires: Date,
    bio: {
      type: String,
    },
    skills: {
      type: [String],
      required: true,
    },
    profilePicture: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Instructor = mongoose.model('Instructor', instructorSchema);

export default Instructor;
