// Routes/auth.routes.js

import express from 'express';
import { logout } from '../controllers/auth.controller.js';
import { verifyInstructor, verifyToken } from '../Midellwere/auth.middleware.js'; // Ensure token is valid

const router = express.Router();

// Logout Route - After successful verification, this route logs the client out
router.post('/logout/:id', verifyToken || verifyInstructor, logout);

export default router;
