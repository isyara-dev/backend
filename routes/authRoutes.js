import express from 'express';
import * as authController from '../controllers/authController.js';
import verifyUser from '../middlewares/verifyUser.js';

const router = express.Router();

// Public route - Untuk frontend setelah login Google
router.post('/save-user', authController.saveUserData);

// Protected route - Memerlukan token
router.get('/me', verifyUser, authController.getMe);

// Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);

export default router; 