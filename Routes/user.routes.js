import express from 'express';
import { registerUser, loginUser, getAllUsers ,getUserById} from '../controllers/user.controller.js';
import { verifyToken } from '../Midellwere/auth.middleware.js';

const router = express.Router();

// Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected Routes
export default router ;
