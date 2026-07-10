import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validateRequest } from '../../middlewares/errorMiddleware.js';
import { authRateLimit } from '../../middlewares/rateLimitMiddleware.js';
import { registerBodySchema, loginBodySchema } from '@repo/shared-types';

const router = Router();

router.post('/register', authRateLimit, validateRequest(registerBodySchema), AuthController.register);
router.post('/login', authRateLimit, validateRequest(loginBodySchema), AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/logout', AuthController.logout);

export default router;
