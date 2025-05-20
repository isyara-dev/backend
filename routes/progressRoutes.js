import express from 'express';
import * as progressController from '../controllers/progressController.js';
// import verifyUser from '../middlewares/verifyUser.js';

const router = express.Router();

// All routes are protected
// router.use(verifyUser);

router.post('/', progressController.updateProgress);
router.get('/sub', progressController.getSubProgress);
router.get('/module/:languageId/:userId', progressController.getModuleProgress);
router.get('/language/:userId', progressController.getLanguageProgress);

export default router; 