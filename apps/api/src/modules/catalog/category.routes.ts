import { Router } from 'express';
import { CatalogController } from './catalog.controller.js';
import { verifyToken } from '../../middlewares/authMiddleware.js';
import { requireRole } from '../../middlewares/roleMiddleware.js';
import { publicRateLimit, apiRateLimit } from '../../middlewares/rateLimitMiddleware.js';
import { publicCache } from '../../middlewares/cacheMiddleware.js';

const router = Router();

// Public
router.get('/', publicRateLimit, publicCache(300), CatalogController.listCategories);

// Admin/staff
router.post('/', verifyToken, apiRateLimit, CatalogController.createCategory);
router.patch('/:id', verifyToken, apiRateLimit, CatalogController.updateCategory);

// Admin only — destructive
router.delete('/:id', verifyToken, requireRole('admin'), apiRateLimit, CatalogController.deleteCategory);

export default router;
