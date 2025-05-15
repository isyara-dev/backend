import express from 'express';
import * as moduleController from './moduleController.js';

const router = express.Router();

// GET /modules - Get all modules
router.get('/', moduleController.getAllModules);

// GET /modules/:id/letters - Get letters by module ID
router.get('/:id/letters', moduleController.getLettersByModuleId);

export default router; 