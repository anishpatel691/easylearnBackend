import express from 'express';
import userRoutes from './user.routes.js';
import courseRoutes from './course.routes.js';
import lectureRoutes from './lecture.routes.js';
import instructorRoutes from './instructor.routes.js';
import logout from './auth.routes.js'
const router = express.Router();

router.use('/users', userRoutes); // User-related routes
router.use('/courses', courseRoutes); // Course-related routes
router.use('/lectures', lectureRoutes); // Lecture-related routes
router.use('/instructors',instructorRoutes) //instructor-releted routes
router.use('/logout',logout) //for client Logout-releted routes
export default router;
