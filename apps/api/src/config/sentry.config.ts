import * as Sentry from '@sentry/node';
import { env } from './env.js';
import { logger } from './logger.config.js';

// No-op when SENTRY_DSN isn't set (e.g. local dev) — Sentry.captureException is
// always safe to call regardless of whether init() ran, so callers never need to
// branch on this themselves.
export function initSentry(): void {
  if (!env.SENTRY_DSN) {
    logger.info('Sentry DSN not set — error tracking disabled (this is expected in local dev)');
    return;
  }
  Sentry.init({ dsn: env.SENTRY_DSN, environment: env.NODE_ENV, tracesSampleRate: 0 });
  logger.info('Sentry error tracking initialized');
}

export { Sentry };
