import { Router } from 'express';
import { CatalogController } from './catalog.controller.js';
import { verifyToken } from '../../middlewares/authMiddleware.js';
import { publicRateLimit, apiRateLimit } from '../../middlewares/rateLimitMiddleware.js';

const router = Router();

// Public
router.get('/', publicRateLimit, CatalogController.listCategories);

// Admin
router.post('/', verifyToken, apiRateLimit, CatalogController.createCategory);
router.patch('/:id', verifyToken, apiRateLimit, CatalogController.updateCategory);
router.delete('/:id', verifyToken, apiRateLimit, CatalogController.deleteCategory);

export default router;
