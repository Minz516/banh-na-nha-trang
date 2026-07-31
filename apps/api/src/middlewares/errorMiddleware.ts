import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import { logger } from '../config/logger.config.js';
import { Sentry } from '../config/sentry.config.js';

/**
 * Global error handler — maps Zod/Mongoose/application errors
 * to the standard envelope: { success: false, error: { statusCode, message, cause } }
 */
export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  // Zod validation error
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        statusCode: 400,
        message: 'Dữ liệu không hợp lệ',
        cause: err.flatten().fieldErrors,
      },
    });
    return;
  }

  // Mongoose duplicate key (E11000)
  if (err instanceof mongoose.mongo.MongoServerError && err.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? 'field';
    res.status(409).json({
      success: false,
      error: {
        statusCode: 409,
        message: `${field} đã tồn tại`,
        cause: err.keyValue,
      },
    });
    return;
  }

  // Mongoose bad ObjectId (e.g. a stale/mock id sent from the client)
  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({
      success: false,
      error: { statusCode: 400, message: `ID không hợp lệ: "${err.value}"`, cause: null },
    });
    return;
  }

  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    res.status(400).json({
      success: false,
      error: {
        statusCode: 400,
        message: 'Dữ liệu không hợp lệ',
        cause: Object.fromEntries(
          Object.entries(err.errors).map(([k, v]) => [k, v.message])
        ),
      },
    });
    return;
  }

  // AppError (custom with statusCode)
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err }, 'AppError (5xx)');
      Sentry.captureException(err);
    }
    res.status(err.statusCode).json({
      success: false,
      error: { statusCode: err.statusCode, message: err.message, cause: err.cause ?? null },
    });
    return;
  }

  // Multer file size error
  if (err instanceof Error && err.message.includes('File too large')) {
    res.status(400).json({
      success: false,
      error: { statusCode: 400, message: 'File quá lớn (tối đa 5MB)', cause: null },
    });
    return;
  }

  // Unknown error
  const message = err instanceof Error ? err.message : 'Internal server error';
  logger.error({ err }, 'Unhandled error');
  Sentry.captureException(err);
  res.status(500).json({
    success: false,
    error: { statusCode: 500, message, cause: null },
  });
}

/**
 * AppError — throw this in any service/controller to produce a clean HTTP error.
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Convenience validator — pass a Zod schema, returns the parsed body or throws.
 */
import type { ZodSchema } from 'zod';

export function validateRequest<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(result.error);
      return;
    }
    req.body = result.data;
    next();
  };
}
