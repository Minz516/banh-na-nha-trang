import type { Request, Response, NextFunction } from 'express';

/**
 * requireRole — gates a route to callers whose JWT payload contains the specified role.
 * Must be used AFTER verifyToken (which sets req.user).
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { statusCode: 401, message: 'Bạn chưa đăng nhập', cause: null },
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: { statusCode: 403, message: 'Bạn không có quyền truy cập', cause: null },
      });
      return;
    }

    next();
  };
}
