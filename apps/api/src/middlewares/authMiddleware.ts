import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/token.util.js';
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
 * verifyToken — requires a valid access_token cookie.
 * Returns 401 if missing or invalid.
 */
export function verifyToken(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.access_token as string | undefined;

  if (!token) {
    res.status(401).json({
      success: false,
      error: { statusCode: 401, message: 'Bạn chưa đăng nhập', cause: null },
    });
    return;
  }

  try {
    req.user = verifyAccessToken(token);
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
