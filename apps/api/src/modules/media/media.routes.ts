import { Router } from 'express';
import { MediaController } from './media.controller.js';
import { verifyToken } from '../../middlewares/authMiddleware.js';
import { apiRateLimit } from '../../middlewares/rateLimitMiddleware.js';
import { upload } from '../../config/multer.config.js';

const router = Router();

// Admin only — only logged-in staff can upload/delete images
router.post('/upload', verifyToken, apiRateLimit, upload.single('file'), MediaController.upload);
router.delete('/:publicId', verifyToken, apiRateLimit, MediaController.destroy);

export default router;
