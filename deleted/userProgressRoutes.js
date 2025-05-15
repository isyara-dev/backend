import express from 'express';
import * as userProgressController from './userProgressController.js';

const router = express.Router();

// GET /users/:userId/progress - Get user progress
router.get('/:userId/progress', userProgressController.getUserProgress);

// POST /users/:userId/progress - Update user progress
router.post('/:userId/progress', userProgressController.updateUserProgress);

export default router; 