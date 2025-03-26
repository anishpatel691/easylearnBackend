import mongoose from 'mongoose';

const lectureSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course', // Reference to the Course model
      required: true,
    },
  },
  { timestamps: true } // Automatically manage createdAt and updatedAt
);

const Lecture = mongoose.model('Lecture', lectureSchema);

export default Lecture;
