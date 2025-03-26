
import Course from "../Models/course.model.js";
import ImageuploadOnCloudinary from "../util/image_cloudinary.js";


export const createCourse = async (req, res) => {
  try {
    const { title, description, price, category, instructorId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Thumbnail image is required!" });
    }

    // Upload thumbnail to Cloudinary
    const uploadResult = await ImageuploadOnCloudinary(req.file.buffer, req.file.mimetype);

    if (!uploadResult) {
      return res.status(500).json({ message: "Failed to upload thumbnail to Cloudinary" });
    }

    const newCourse = new Course({
      title,
      description,
      price,
      category,
      instructorId,
      thumbnail: uploadResult.secure_url, // Store Cloudinary image URL
    });

    await newCourse.save();
    res.status(201).json({ message: "Course created successfully", course: newCourse });
  } catch (err) {
    console.error("❌ Error creating course:", err);
    res.status(500).json({ error: err.message });
  }
};

// Get All Courses
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('instructorId', 'name email');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a Single Course
import mongoose from "mongoose";

export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
console.log(id);

    // Validate ObjectId before querying the database
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid course ID" });
    }

    const course = await Course.findById(id)
      .populate({
        path: "lectures",
        select: "title videoUrl createdAt",
      })
      .populate({
        path: "instructorId",
        select: "name email",
      });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json(course);
  } catch (err) {
    console.error("❌ Error fetching course:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
};



export const getCoursesByInstructor = async (req, res) => {
  try {
    const { instructorId } = req.params;

    // Validate instructor ID
    if (!instructorId) {
      return res.status(400).json({ error: "Instructor ID is required" });
    }

    const courses = await Course.find({ instructorId });

    if (!courses.length) {
      return res.status(404).json({ message: "No courses found for this instructor." });
    }

    res.json(courses);
  } catch (error) {
    console.error("❌ Error fetching instructor's courses:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};





// Delete Course
export const deleteCourse = async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);
  
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
  
      // Check if the logged-in user is the instructor of the course
      if (course.instructorId.toString() !== req.user.id) {
        return res.status(403).json({ message: 'You are not authorized to delete this course' });
      }
  
      await course.remove(); // Remove the course from the database
  
      res.json({ message: 'Course deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Server error: ' + err.message });
    }
  };