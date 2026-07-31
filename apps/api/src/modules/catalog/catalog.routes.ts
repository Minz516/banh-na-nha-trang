import { Router } from 'express';
import { CatalogController } from './catalog.controller.js';
import { verifyToken } from '../../middlewares/authMiddleware.js';
import { requireRole } from '../../middlewares/roleMiddleware.js';
import { publicRateLimit, apiRateLimit } from '../../middlewares/rateLimitMiddleware.js';

const router = Router();

// Public
router.get('/', publicRateLimit, CatalogController.listProducts);
router.get('/:slug', publicRateLimit, CatalogController.getProductBySlug);

// Admin/staff — day-to-day catalog editing
router.get('/admin/all', verifyToken, apiRateLimit, CatalogController.adminListProducts);
router.post('/', verifyToken, apiRateLimit, CatalogController.createProduct);
router.post('/bulk', verifyToken, apiRateLimit, CatalogController.bulkCreateProducts);
router.patch('/:id', verifyToken, apiRateLimit, CatalogController.updateProduct);
router.patch('/:id/stock', verifyToken, apiRateLimit, CatalogController.updateStock);

// Admin only — deleting a product is destructive
router.delete('/:id', verifyToken, requireRole('admin'), apiRateLimit, CatalogController.deleteProduct);

export default router;
