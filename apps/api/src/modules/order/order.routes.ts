import { Router } from 'express';
import { OrderController } from './order.controller.js';
import { verifyToken, optionalVerifyToken } from '../../middlewares/authMiddleware.js';
import { requireRole } from '../../middlewares/roleMiddleware.js';
import { publicRateLimit } from '../../middlewares/rateLimitMiddleware.js';

const router = Router();

// Public / optional-auth
router.post('/', optionalVerifyToken, ...OrderController.placeOrder);
router.post('/lookup', publicRateLimit, ...OrderController.lookup);

// Authenticated user
router.get('/me', verifyToken, OrderController.myOrders);

// Admin only
router.get('/', verifyToken, requireRole('admin'), OrderController.listOrders);
router.post('/pos', verifyToken, requireRole('admin'), ...OrderController.posOrder);
router.get('/:id', verifyToken, requireRole('admin'), OrderController.getOrder);
router.patch('/:id/status', verifyToken, requireRole('admin'), ...OrderController.updateStatus);
router.post('/:id/print', verifyToken, requireRole('admin'), OrderController.printOrder);

export default router;
