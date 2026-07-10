import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { configureCloudinary } from './config/cloudinary.config.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';

// Module routes
import authRoutes from './modules/auth/auth.routes.js';
import customerRoutes from './modules/customer/customer.routes.js';
import catalogRoutes from './modules/catalog/catalog.routes.js';
import categoryRoutes from './modules/catalog/category.routes.js';
import cartRoutes from './modules/cart/cart.routes.js';
import orderRoutes from './modules/order/order.routes.js';
import voucherRoutes from './modules/voucher/voucher.routes.js';
import blogRoutes from './modules/blog/blog.routes.js';
import mediaRoutes from './modules/media/media.routes.js';

// Event listeners (wire cross-module side-effects)
import { registerCustomerEvents } from './modules/customer/customer.events.js';

export function createApp(): express.Application {
  // Configure Cloudinary as early as possible
  configureCloudinary();

  // Wire cross-module event listeners
  registerCustomerEvents();

  const app = express();

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

  // ── Health check ──────────────────────────────────────────────────────────────
  app.get('/health', (_req: express.Request, res: express.Response) => {
    res.json({ success: true, data: { status: 'ok', env: env.NODE_ENV } });
  });

  // ── Routes ────────────────────────────────────────────────────────────────────
  app.use('/api/auth', authRoutes);
  app.use('/api/customers', customerRoutes);
  app.use('/api/products', catalogRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/cart', cartRoutes);
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
