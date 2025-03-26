import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './Models/course.model.js';
import Lecture from './Models/lectures.model.js';
import User from './Models/user.model.js';
import connectDB from './database.js';

// Load environment variables
dotenv.config();

const testCourseAndLectures = async () => {
  await connectDB();

  try {
    // 1. Create an instructor (User)
    const instructor = new User({
      name: 'Alice Instructor',
      email: 'alice@example.com',
      password: 'securepassword',
      role: 'instructor',
    });
    const savedInstructor = await instructor.save();
    console.log('Instructor saved:', savedInstructor);

    // 2. Create a course
    const course = new Course({
      title: 'Learn Python',
      description: 'An in-depth Python course for beginners.',
      price: 999,
      category: 'Programming',
      instructor: savedInstructor._id,
      tags: ['Python', 'Programming', 'Data Science'],
    });
    const savedCourse = await course.save();
    console.log('Course saved:', savedCourse);

    // 3. Create lectures for the course
    const lecture1 = new Lecture({
      title: 'Introduction to Python',
      description: 'Learn the basics of Python programming.',
      videoUrl: 'https://example.com/video1',
      duration: 30, // 30 minutes
      course: savedCourse._id,
    });

    const lecture2 = new Lecture({
      title: 'Python Data Structures',
      description: 'Understand lists, tuples, and dictionaries in Python.',
      videoUrl: 'https://example.com/video2',
      duration: 40, // 40 minutes
      course: savedCourse._id,
    });

    const savedLecture1 = await lecture1.save();
    const savedLecture2 = await lecture2.save();
    console.log('Lecture 1 saved:', savedLecture1);
    console.log('Lecture 2 saved:', savedLecture2);

    // 4. Add lectures to the course
    savedCourse.lectures.push(savedLecture1._id);
    savedCourse.lectures.push(savedLecture2._id);
    await savedCourse.save();

    console.log('Lectures added to course:', savedCourse);

    // 5. Fetch course with lectures (Populate lectures)
    const populatedCourse = await Course.findById(savedCourse._id).populate('lectures');
    console.log('Populated Course:', JSON.stringify(populatedCourse, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

testCourseAndLectures();
