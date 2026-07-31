import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { configureCloudinary } from './config/cloudinary.config.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import { debugLogMiddleware } from './middlewares/debugLogMiddleware.js';

// Module routes
import authRoutes from './modules/auth/auth.routes.js';
import customerRoutes from './modules/customer/customer.routes.js';
import catalogRoutes from './modules/catalog/catalog.routes.js';
import categoryRoutes from './modules/catalog/category.routes.js';
import orderRoutes from './modules/order/order.routes.js';
import voucherRoutes from './modules/voucher/voucher.routes.js';
import blogRoutes from './modules/blog/blog.routes.js';
import mediaRoutes from './modules/media/media.routes.js';

// Event listeners (wire cross-module side-effects)
import { registerCustomerEvents } from './modules/customer/customer.events.js';
import { registerCatalogEvents } from './modules/catalog/catalog.events.js';
import { registerVoucherEvents } from './modules/voucher/voucher.events.js';

export function createApp(): express.Application {
  // Configure Cloudinary as early as possible
  configureCloudinary();

  // Wire cross-module event listeners (ORDER_PLACED / ORDER_CANCELLED / STOCK_LOW consumers)
  registerCustomerEvents();
  registerCatalogEvents();
  registerVoucherEvents();

  const app = express();

  // ── Security headers ──────────────────────────────────────────────────────────
  // API is pure JSON — no HTML/scripts served here, so helmet's defaults
  // (HSTS, no-sniff, frameguard, etc.) apply cleanly with no CSP tuning needed.
  // crossOriginResourcePolicy must be relaxed to 'cross-origin': storefront and
  // admin are separate origins from the API by design (see CORS allow-list below),
  // and helmet's default 'same-origin' would make browsers block their fetches
  // even though CORS explicitly allows them — CORP is enforced independently of CORS.
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  // ── CORS ──────────────────────────────────────────────────────────────────────
  // Phase 6: explicit allow-list, credentials: true, no wildcard
  const allowedOrigins = [env.CLIENT_ORIGIN, env.ADMIN_ORIGIN];
  app.use(
    cors({
      origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow server-to-server or same-origin requests (no Origin header)
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS: origin "${origin}" not allowed`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // ── Body parsing ──────────────────────────────────────────────────────────────
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // ── Debug logging (every request) ────────────────────────────────────────────
  app.use(debugLogMiddleware);

  // ── Health check ──────────────────────────────────────────────────────────────
  app.get('/health', (_req: express.Request, res: express.Response) => {
    res.json({ success: true, data: { status: 'ok', env: env.NODE_ENV } });
  });

  // ── Routes ────────────────────────────────────────────────────────────────────
  app.use('/api/auth', authRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/products', catalogRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/vouchers', voucherRoutes);
  app.use('/api/blog', blogRoutes);
  app.use('/api/media', mediaRoutes);

  // ── 404 handler ───────────────────────────────────────────────────────────────
  app.use((_req: express.Request, res: express.Response) => {
    res.status(404).json({ success: false, error: { statusCode: 404, message: 'Route not found', cause: null } });
  });

  // ── Global error handler ──────────────────────────────────────────────────────
  app.use(errorMiddleware);

  return app;
}
