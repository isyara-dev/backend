import express from 'express';
import * as letterController from '../controllers/letterController.js';

const router = express.Router();

// Public routes
router.get('/', letterController.getAllLetters);
router.get('/:char', letterController.getLetterByChar);

export default router; 