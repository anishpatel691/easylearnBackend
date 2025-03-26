import uploadOncloudinary from "../util/Cloudinary.js";
import Course from "../Models/course.model.js";

// Upload Course
const createCourse = async (req, res) => {
  const { title, description, category, price, instructorId } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "Thumbnail is required!" });
  }

  try {
    // Upload thumbnail to Cloudinary
    const uploadResult = await uploadOncloudinary(req.file.path);

    // Save course in DB
    const newCourse = new Course({
      title,
      description,
      category,
      price,
      instructorId,
      thumbnail: uploadResult.secure_url,
    });

    await newCourse.save();
    res.status(201).json({ message: "Course uploaded successfully!", course: newCourse });
  } catch (error) {
    res.status(500).json({ message: "Course upload failed!", error });
  }
};

// Fetch all Courses
const getAllCourses = async (req, res) => {
  const courses = await Course.find();
  res.json(courses);
};

export { createCourse, getAllCourses };
