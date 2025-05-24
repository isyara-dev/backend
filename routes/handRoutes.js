import express from 'express';
import * as handController from '../controllers/handController.js';

const router = express.Router();

// Public routes
router.get('/', handController.getHands);
router.get('/:char', handController.getHandByChar);

export default router;
