import { Router } from 'express';
import { MediaController } from './media.controller.js';
import { verifyToken } from '../../middlewares/authMiddleware.js';
import { requireRole } from '../../middlewares/roleMiddleware.js';
import { upload } from '../../config/multer.config.js';

const router = Router();

// Admin only — only admins can upload/delete images
router.post('/upload', verifyToken, requireRole('admin'), upload.single('file'), MediaController.upload);
router.delete('/:publicId', verifyToken, requireRole('admin'), MediaController.destroy);

export default router;
