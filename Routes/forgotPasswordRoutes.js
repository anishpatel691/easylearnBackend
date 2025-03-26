import express from 'express';
  import { sendOTP, verifyOTP, resetPassword} from '../controllers/authController.js';

const Forgrtrouter = express.Router();

Forgrtrouter.post('/send-otp', sendOTP);
Forgrtrouter.post('/verify-otp', verifyOTP);
Forgrtrouter.post('/reset-password', resetPassword);


export default Forgrtrouter;
