import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/token.util.js';
import { AuthInterfaces } from '../modules/auth/auth.interfaces.js';
import type { JwtPayload } from '@repo/shared-types';

// Augment Express Request to carry the decoded JWT payload
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * verifyToken — requires a valid access_token cookie AND an admin/staff account
 * that is still active. Admin routes/endpoints are guarded by this middleware;
 * every User in the system is staff, there is no separate customer login.
 *
 * Re-checking the account on every request (not just the JWT signature/expiry)
 * means deactivating a User revokes access immediately, instead of waiting up
 * to 15 minutes for their existing access_token to expire.
 */
export async function verifyToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = req.cookies?.access_token as string | undefined;

  if (!token) {
    res.status(401).json({
      success: false,
      error: { statusCode: 401, message: 'Bạn chưa đăng nhập', cause: null },
    });
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await AuthInterfaces.getUserById(payload.userId);

    if (!user || !user.isActive) {
      res.status(403).json({
        success: false,
        error: { statusCode: 403, message: 'Tài khoản không có quyền truy cập', cause: null },
      });
      return;
    }

    req.user = payload;
    next();
  } catch (err) {
    const isExpired = (err as Error).name === 'TokenExpiredError';
    res.status(401).json({
      success: false,
      error: {
        statusCode: 401,
        message: isExpired ? 'Phiên đăng nhập đã hết hạn' : 'Token không hợp lệ',
        cause: isExpired ? 'JWT_EXPIRED' : null,
      },
    });
  }
}

/**
 * optionalVerifyToken — attaches req.user if a valid token exists, but does not fail
 * if it is absent. Used on POST /orders and POST /vouchers/validate.
 */
export function optionalVerifyToken(req: Request, _res: Response, next: NextFunction): void {
  const token = req.cookies?.access_token as string | undefined;

  if (token) {
    try {
      req.user = verifyAccessToken(token);
    } catch {
      // Invalid token is treated as unauthenticated — not an error on optional routes
    }
  }

  next();
}
