import { Router } from 'express';
import { CustomerController } from './customer.controller.js';
import { verifyToken } from '../../middlewares/authMiddleware.js';
import { apiRateLimit } from '../../middlewares/rateLimitMiddleware.js';

const router = Router();

// Admin only — customers have no self-service account, so there is no /me here.
// Customer records are created/updated only via the guest checkout form (POST /orders).
router.get('/', verifyToken, apiRateLimit, CustomerController.list);
router.get('/export', verifyToken, apiRateLimit, CustomerController.export);
router.get('/:id', verifyToken, apiRateLimit, CustomerController.getById);

export default router;
