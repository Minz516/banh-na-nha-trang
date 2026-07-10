import { Router } from 'express';
import { CustomerController } from './customer.controller.js';
import { verifyToken } from '../../middlewares/authMiddleware.js';
import { requireRole } from '../../middlewares/roleMiddleware.js';
import { validateRequest } from '../../middlewares/errorMiddleware.js';
import { updateCustomerBodySchema, addAddressBodySchema } from '@repo/shared-types';

const router = Router();

// Customer self-service
router.get('/me', verifyToken, CustomerController.getMe);
router.patch('/me', verifyToken, validateRequest(updateCustomerBodySchema), CustomerController.updateMe);
router.post('/addresses', verifyToken, validateRequest(addAddressBodySchema), CustomerController.addAddress);

// Admin routes
router.get('/', verifyToken, requireRole('admin'), CustomerController.list);
router.get('/export', verifyToken, requireRole('admin'), CustomerController.export);
router.get('/:id', verifyToken, requireRole('admin'), CustomerController.getById);

export default router;
