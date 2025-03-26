import express from "express";
import { getCoursesByInstructor, getCourseById, createCourse, deleteCourse, getAllCourses } from "../controllers/course.controller.js";
import Imageupload from "../Midellwere/ImageMulter.Middleware.js"; 
import { verifyToken } from "../Midellwere/auth.middleware.js"; // Ensure authentication for protected routes

const router = express.Router();

// Public Routes
router.get("/:id", getCourseById); // Get a single course by ID
router.get("/", getAllCourses); // Get all courses
router.post("/", Imageupload.single("thumbnail"), createCourse); // Upload a course with a thumbnail

// 🔹 Fetch courses by instructor ID (Protected Route)
router.get("/instructor/:instructorId", verifyToken, getCoursesByInstructor); 

// Protected Routes (Require authentication)
router.delete("/:id", verifyToken, deleteCourse); // Delete a course (Only instructor can delete)

export default router;
