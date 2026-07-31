import { z } from 'zod';

// All process.env reads happen here. Every other file imports from this module.
// Fails fast on startup if a required variable is missing or malformed.

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),

  // MongoDB
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  // JWT — shared secret must match apps/storefront's lib/auth-edge.ts
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters'),

  // CORS origins
  CLIENT_ORIGIN: z.string().url().default('http://localhost:3000'),
  ADMIN_ORIGIN: z.string().url().default('http://localhost:5173'),

  // Cloudinary (optional in dev)
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  // Seed Admin (CLI seeder only — pnpm seed:admin)
  ADMIN_EMAIL: z.string().email().default('admin@banhtrangnhana.com'),
  ADMIN_PASSWORD: z.string().min(6).default('adminPassword123'),
  ADMIN_PHONE: z.string().optional(),

  // Error tracking (optional — unset disables Sentry entirely, see sentry.config.ts)
  SENTRY_DSN: z.string().optional(),
});

const _parsed = envSchema.safeParse(process.env);

if (!_parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(_parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = _parsed.data;
