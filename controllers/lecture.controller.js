import Course from "../Models/course.model.js";
import Lecture from "../Models/lectures.model.js";
import uploadOnCloudinary from "../util/Cloudinary.js";

export const addLecture = async (req, res) => {
  try {
    const { courseId, title, description } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Video file is required!" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Upload video to Cloudinary
    const uploadResult = await uploadOnCloudinary(req.file.buffer, req.file.mimetype);

    if (!uploadResult) {
      return res.status(500).json({ message: "Failed to upload video to Cloudinary" });
    }

    const lecture = new Lecture({
      title,
      description,
      videoUrl: uploadResult.secure_url, // ✅ Store Cloudinary video URL
      course: courseId,
    });

    await lecture.save();

    course.lectures.push(lecture._id);
    course.lectureCount = course.lectures.length;
    await course.save();

    res.status(201).json({ message: "Lecture added successfully!", lecture });
  } catch (err) {
    console.error("❌ Error adding lecture:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getAllLectures = async (req, res) => {
  try {
    const lecture = await Lecture.find().populate('instructorId', 'name email');
    res.json(lecture);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getLectureById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Received Lecture ID:", id); // Debugging log

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid lecture ID", receivedId: id });
    }

    const lecture = await Lecture.findById(id);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    res.status(200).json(lecture);
  } catch (err) {
    console.error("❌ Error fetching lecture:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
};

