import { Router } from 'express';
import { VoucherController } from './voucher.controller.js';
import { verifyToken, optionalVerifyToken } from '../../middlewares/authMiddleware.js';
import { apiRateLimit, checkoutRateLimit } from '../../middlewares/rateLimitMiddleware.js';

const router = Router();

// Optional auth — guests can validate vouchers (D6: phone-keyed)
router.post('/validate', optionalVerifyToken, checkoutRateLimit, VoucherController.validate);

// Admin
router.get('/', verifyToken, apiRateLimit, VoucherController.list);
router.post('/', verifyToken, apiRateLimit, VoucherController.create);
router.patch('/:id', verifyToken, apiRateLimit, VoucherController.update);
router.delete('/:id', verifyToken, apiRateLimit, VoucherController.delete);

export default router;
