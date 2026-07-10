import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { verifyToken } from '../../middlewares/authMiddleware.js';
import { validateRequest } from '../../middlewares/errorMiddleware.js';
import { authRateLimit } from '../../middlewares/rateLimitMiddleware.js';
import { loginBodySchema } from '@repo/shared-types';

const router = Router();

// Admin/staff login only — there is no customer-facing registration.
router.post('/login', authRateLimit, validateRequest(loginBodySchema), AuthController.login);
router.post('/refresh-token', authRateLimit, AuthController.refreshToken);
router.post('/logout', AuthController.logout);
router.get('/me', verifyToken, AuthController.me);

export default router;
