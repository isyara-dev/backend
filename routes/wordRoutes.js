import express from 'express';
import * as wordController from '../controllers/wordController.js';
import verifyUser from '../middlewares/verifyUser.js';

const router = express.Router();

// PENTING: Letakkan route spesifik sebelum route dengan parameter
// Public routes
router.get('/random', wordController.getRandomWord);

// GET /words - Get all words
router.get('/', wordController.getAllWords);

// Protected routes
router.post('/success', verifyUser, wordController.wordSuccess);

// POST /word-attempts - Save word attempt
router.post('/', wordController.saveWordAttempt);

// GET /users/:userId/word-attempts - Get user's word attempts
router.get('/:userId', wordController.getUserWordAttempts);

export default router; 