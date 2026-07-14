import type { Request, Response, NextFunction } from 'express';

/** Logs method, path, params, query, and body for every incoming request. */
export function debugLogMiddleware(req: Request, _res: Response, next: NextFunction): void {
  console.log(`[DEBUG] ${req.method} ${req.originalUrl}`, {
    params: req.params,
    query: req.query,
    body: req.body,
  });
  next();
}
