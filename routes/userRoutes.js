import express from 'express';
import * as userController from '../controllers/userController.js';
import verifyUser from '../middlewares/verifyUser.js';

const router = express.Router();

// Public routes
router.get('/:id', userController.getUserById);

// Protected routes
router.put('/:id', verifyUser, userController.updateUser);

export default router;
