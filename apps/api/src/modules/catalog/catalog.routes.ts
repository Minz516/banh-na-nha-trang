import { Router } from 'express';
import { CatalogController } from './catalog.controller.js';
import { verifyToken } from '../../middlewares/authMiddleware.js';
import { publicRateLimit, apiRateLimit } from '../../middlewares/rateLimitMiddleware.js';

const router = Router();

// Public
router.get('/', publicRateLimit, CatalogController.listProducts);
router.get('/:slug', publicRateLimit, CatalogController.getProductBySlug);

// Admin — every logged-in User is staff, there is no other role
router.post('/', verifyToken, apiRateLimit, CatalogController.createProduct);
router.post('/bulk', verifyToken, apiRateLimit, CatalogController.bulkCreateProducts);
router.patch('/:id', verifyToken, apiRateLimit, CatalogController.updateProduct);
router.patch('/:id/stock', verifyToken, apiRateLimit, CatalogController.updateStock);
router.delete('/:id', verifyToken, apiRateLimit, CatalogController.deleteProduct);

export default router;
