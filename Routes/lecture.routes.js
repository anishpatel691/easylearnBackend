import express from "express";
import { addLecture, getAllLectures, getLectureById } from "../controllers/lecture.controller.js";
import { verifyToken } from "../Midellwere/auth.middleware.js";
import upload from "../Midellwere/Multer.middleware.js";

const router = express.Router();

router.post("/addlecture", verifyToken, upload.single("file"), addLecture); // ✅ Make sure "file" matches frontend
router.get("/fd", getAllLectures); // Get all courses
router.get("/lectures/:id", getLectureById);
 // Get a single course by ID
export default router;
