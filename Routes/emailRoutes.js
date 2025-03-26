// File: /api/routes/emailRoutes.js
import express from 'express';
import * as emailController from '../controllers/emailController.js';

const emailrouter = express.Router();

// Send welcome email route
emailrouter.post('/send-welcome', emailController.sendWelcomeEmail);

export default emailrouter;