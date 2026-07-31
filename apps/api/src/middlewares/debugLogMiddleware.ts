import type { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.config.js';

/** Logs method, path, params, query, and body for every incoming request. */
export function debugLogMiddleware(req: Request, _res: Response, next: NextFunction): void {
  logger.debug({ method: req.method, url: req.originalUrl, params: req.params, query: req.query, body: req.body }, 'incoming request');
  next();
}
