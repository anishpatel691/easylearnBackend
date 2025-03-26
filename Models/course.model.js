import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a course title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters']
    },
    slug: {
      type: String,
      unique: true
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    price: {
      type: Number,
    required: [true, 'Please add a price'],
    default: 0
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      
    },
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Instructor',
    },
    thumbnail: {  // Image URL  of the course
      type: String,
      required: true,
    },
    lectures: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lecture', // References the Lecture model
      },
    ],
  },
  { timestamps: true } // Automatically manage createdAt and updatedAt
);

const Course = mongoose.model('Course', courseSchema);

export default Course;
