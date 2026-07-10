import type { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.js';
import { AuthDTO } from './auth.dto.js';
import { issueTokenCookies, clearTokenCookies, verifyRefreshToken } from '../../utils/token.util.js';

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
};
