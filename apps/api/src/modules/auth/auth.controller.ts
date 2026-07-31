import type { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import { AuthDTO } from './auth.dto.js';
import { issueTokenCookies, clearTokenCookies, verifyRefreshToken } from '../../utils/token.util.js';
import { validateRequest } from '../../middlewares/errorMiddleware.js';
import { createUserBodySchema, updateUserBodySchema } from '@repo/shared-types';

export const AuthController = {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await AuthService.login(req.body);
      const payload = { userId: user._id.toString(), email: user.email };
      issueTokenCookies(res, payload);
      res.json({
        success: true,
        message: 'Đăng nhập thành công',
        data: AuthDTO.userResponse(user),
        meta: null,
      });
    } catch (err) {
      next(err);
    }
  },

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.cookies?.refresh_token as string | undefined;
      if (!token) {
        res.status(401).json({ success: false, error: { statusCode: 401, message: 'Không có refresh token', cause: null } });
        return;
      }
      const payload = verifyRefreshToken(token);
      const user = await AuthService.getUserById(payload.userId);
      issueTokenCookies(res, { userId: user._id.toString(), email: user.email });
      res.json({ success: true, message: 'Token đã được làm mới', data: null, meta: null });
    } catch (err) {
      next(err);
    }
  },

  async logout(_req: Request, res: Response): Promise<void> {
    clearTokenCookies(res);
    res.json({ success: true, message: 'Đăng xuất thành công', data: null, meta: null });
  },

  // GET /auth/me — lets the admin SPA verify its session against the real cookie,
  // since it cannot read the httpOnly access_token itself.
  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await AuthService.getUserById(req.user!.userId);
      res.json({ success: true, message: 'OK', data: AuthDTO.userResponse(user), meta: null });
    } catch (err) {
      next(err);
    }
  },

  // ── User management (admin only) ────────────────────────────────────────────

  createUser: [
    validateRequest(createUserBodySchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const user = await AuthService.createUser(req.body);
        res.status(201).json({ success: true, message: 'Đã tạo tài khoản', data: AuthDTO.userListItem(user), meta: null });
      } catch (err) {
        next(err);
      }
    },
  ],

  async listUsers(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await AuthService.listUsers();
      res.json({ success: true, data: users.map(AuthDTO.userListItem), meta: null });
    } catch (err) {
      next(err);
    }
  },

  updateUser: [
    validateRequest(updateUserBodySchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const user = await AuthService.updateUser(req.params.id as string, req.body, req.user!.userId);
        res.json({ success: true, message: 'Đã cập nhật', data: AuthDTO.userListItem(user), meta: null });
      } catch (err) {
        next(err);
      }
    },
  ],
};
