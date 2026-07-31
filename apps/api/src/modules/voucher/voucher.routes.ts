import { Router } from 'express';
import { VoucherController } from './voucher.controller.js';
import { verifyToken, optionalVerifyToken } from '../../middlewares/authMiddleware.js';
import { requireRole } from '../../middlewares/roleMiddleware.js';
import { apiRateLimit, checkoutRateLimit } from '../../middlewares/rateLimitMiddleware.js';

const router = Router();

// Optional auth — guests can validate vouchers (D6: phone-keyed)
router.post('/validate', optionalVerifyToken, checkoutRateLimit, VoucherController.validate);

// Any staff can view vouchers (needed at the POS/checkout desk)
router.get('/', verifyToken, apiRateLimit, VoucherController.list);

// Admin only — vouchers are a financial/promotional control
router.post('/', verifyToken, requireRole('admin'), apiRateLimit, VoucherController.create);
router.patch('/:id', verifyToken, requireRole('admin'), apiRateLimit, VoucherController.update);
router.delete('/:id', verifyToken, requireRole('admin'), apiRateLimit, VoucherController.delete);

export default router;
