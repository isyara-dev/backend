import express from 'express';
import * as handController from '../controllers/handController.js';

const router = express.Router();

// Public routes
router.get('/', handController.getHands);

export default router; 