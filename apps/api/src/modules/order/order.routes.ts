import { Router } from 'express';
import { OrderController } from './order.controller.js';
import { verifyToken } from '../../middlewares/authMiddleware.js';
import { publicRateLimit, apiRateLimit, checkoutRateLimit } from '../../middlewares/rateLimitMiddleware.js';

const router = Router();

// Public — checkout is guest-only, no account required
router.post('/', checkoutRateLimit, ...OrderController.placeOrder);
router.post('/lookup', publicRateLimit, ...OrderController.lookup);

// Admin only
router.get('/', verifyToken, apiRateLimit, OrderController.listOrders);
router.post('/pos', verifyToken, apiRateLimit, ...OrderController.posOrder);
router.get('/:id', verifyToken, apiRateLimit, OrderController.getOrder);
router.patch('/:id/status', verifyToken, apiRateLimit, ...OrderController.updateStatus);
router.post('/:id/print', verifyToken, apiRateLimit, OrderController.printOrder);

export default router;
