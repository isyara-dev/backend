import express from 'express';
import * as letterController from '../controllers/submoduleController.js';

const router = express.Router();

// Public routes
router.get('/', letterController.getAllSubmodules);
router.get('/:char', letterController.getSubmoduleByChar);

export default router; 