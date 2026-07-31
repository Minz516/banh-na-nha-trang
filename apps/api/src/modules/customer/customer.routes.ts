import { Router } from 'express';
import { CustomerController } from './customer.controller.js';
import { verifyToken } from '../../middlewares/authMiddleware.js';
import { requireRole } from '../../middlewares/roleMiddleware.js';
import { apiRateLimit } from '../../middlewares/rateLimitMiddleware.js';

const router = Router();

// Admin/staff — customers have no self-service account, so there is no /me here.
// Customer records are created/updated only via the guest checkout form (POST /orders).
router.get('/', verifyToken, apiRateLimit, CustomerController.list);

// Admin only — bulk PII export. Must stay ahead of '/:id' or Express would match
// the literal path segment "export" as an :id param instead.
router.get('/export', verifyToken, requireRole('admin'), apiRateLimit, CustomerController.export);

router.get('/:id', verifyToken, apiRateLimit, CustomerController.getById);

export default router;
