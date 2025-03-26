import express from 'express';
import { registerInstructor, getInstructorProfile ,loginInstructor} from '../controllers/instructor.controller.js';
import { verifyToken } from '../Midellwere/auth.middleware.js';


const router = express.Router();

// Register instructor
router.post('/register', registerInstructor);
router.post('/login', loginInstructor);


// Get instructor profile
router.get('/profile', verifyToken, getInstructorProfile);
export default router;
