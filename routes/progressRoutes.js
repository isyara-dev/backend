import express from 'express';
import * as progressController from '../controllers/progressController.js';
import verifyUser from '../middlewares/verifyUser.js';

const router = express.Router();

// All routes are protected
router.use(verifyUser);

router.get('/', progressController.getUserProgress);
router.post('/', progressController.updateProgress);
router.get('/:letter_id', progressController.getLetterProgress);

export default router; 