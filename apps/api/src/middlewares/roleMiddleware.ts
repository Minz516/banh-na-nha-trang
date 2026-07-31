import type { Request, Response, NextFunction } from 'express';
import type { UserRole } from '@repo/shared-types';

/**
 * requireRole — gates a route to specific roles. Must run after verifyToken,
 * which attaches the freshly-read role from the DB onto req.user (see
 * authMiddleware.ts) — never trust a role baked into the JWT itself.
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const role = req.user?.role;
    if (!role || !roles.includes(role)) {
      res.status(403).json({
        success: false,
        error: { statusCode: 403, message: 'Bạn không có quyền thực hiện thao tác này', cause: null },
      });
      return;
    }
    next();
  };
}
