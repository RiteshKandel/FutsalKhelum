import express from 'express';
import { register, login, verifyOtp, updateProfile } from '../controllers/authController.js';
import { validate } from '../middlewares/validate.js';
import { protect } from '../middlewares/auth.js';
import { registerSchema, loginSchema, verifyOtpSchema } from '../utils/validators.js';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/verify-otp', validate(verifyOtpSchema), verifyOtp);
router.put('/profile', protect, updateProfile);

export default router;
