import { Router } from 'express';
import { CatalogController } from './catalog.controller.js';
import { verifyToken } from '../../middlewares/authMiddleware.js';
import { requireRole } from '../../middlewares/roleMiddleware.js';
import { publicRateLimit } from '../../middlewares/rateLimitMiddleware.js';

const router = Router();

// Public
router.get('/', publicRateLimit, CatalogController.listProducts);
router.get('/:slug', publicRateLimit, CatalogController.getProductBySlug);

// Admin
router.post('/', verifyToken, requireRole('admin'), CatalogController.createProduct);
router.post('/bulk', verifyToken, requireRole('admin'), CatalogController.bulkCreateProducts);
router.patch('/:id', verifyToken, requireRole('admin'), CatalogController.updateProduct);
router.patch('/:id/stock', verifyToken, requireRole('admin'), CatalogController.updateStock);
router.delete('/:id', verifyToken, requireRole('admin'), CatalogController.deleteProduct);

export default router;
