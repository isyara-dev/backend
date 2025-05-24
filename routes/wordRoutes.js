import express from 'express';
import * as wordController from '../controllers/wordController.js';
import verifyUser from '../middlewares/verifyUser.js';

const router = express.Router();

// PENTING: Letakkan route spesifik sebelum route dengan parameter
// Public routes
router.get('/random', wordController.getRandomWord);

// Protected routes
router.post('/submit-session', verifyUser, wordController.submitWordSession);

export default router;
