import { Router } from 'express';
import { VoucherController } from './voucher.controller.js';
import { verifyToken } from '../../middlewares/authMiddleware.js';
import { requireRole } from '../../middlewares/roleMiddleware.js';
import { optionalVerifyToken } from '../../middlewares/authMiddleware.js';

const router = Router();

// Optional auth — guests can validate vouchers (D6: phone-keyed)
router.post('/validate', optionalVerifyToken, VoucherController.validate);

// Admin
router.get('/', verifyToken, requireRole('admin'), VoucherController.list);
router.post('/', verifyToken, requireRole('admin'), VoucherController.create);
router.patch('/:id', verifyToken, requireRole('admin'), VoucherController.update);
router.delete('/:id', verifyToken, requireRole('admin'), VoucherController.delete);

export default router;
