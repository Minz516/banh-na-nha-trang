import { Router } from 'express';
import { CatalogController } from './catalog.controller.js';
import { verifyToken } from '../../middlewares/authMiddleware.js';
import { requireRole } from '../../middlewares/roleMiddleware.js';
import { publicRateLimit } from '../../middlewares/rateLimitMiddleware.js';

const router = Router();

// Public
router.get('/', publicRateLimit, CatalogController.listCategories);

// Admin
router.post('/', verifyToken, requireRole('admin'), CatalogController.createCategory);
router.patch('/:id', verifyToken, requireRole('admin'), CatalogController.updateCategory);
router.delete('/:id', verifyToken, requireRole('admin'), CatalogController.deleteCategory);

export default router;
