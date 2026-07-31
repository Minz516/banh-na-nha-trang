import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { verifyToken } from '../../middlewares/authMiddleware.js';
import { requireRole } from '../../middlewares/roleMiddleware.js';
import { validateRequest } from '../../middlewares/errorMiddleware.js';
import { authRateLimit, apiRateLimit } from '../../middlewares/rateLimitMiddleware.js';
import { loginBodySchema } from '@repo/shared-types';

const router = Router();

// Admin/staff login only — there is no customer-facing registration.
router.post('/login', authRateLimit, validateRequest(loginBodySchema), AuthController.login);
router.post('/refresh-token', authRateLimit, AuthController.refreshToken);
router.post('/logout', AuthController.logout);
router.get('/me', verifyToken, AuthController.me);

// Admin only — creating/managing other Users (staff or additional admins)
router.get('/users', verifyToken, requireRole('admin'), apiRateLimit, AuthController.listUsers);
router.post('/users', verifyToken, requireRole('admin'), apiRateLimit, ...AuthController.createUser);
router.patch('/users/:id', verifyToken, requireRole('admin'), apiRateLimit, ...AuthController.updateUser);

export default router;
