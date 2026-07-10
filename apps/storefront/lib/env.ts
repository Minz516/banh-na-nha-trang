import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:3000/api'),
  API_URL: z.string().url().default('http://127.0.0.1:5000/api'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET is required and must be at least 16 chars'),
});

const _parsed = envSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  API_URL: process.env.API_URL,
  JWT_SECRET: process.env.JWT_SECRET,
});

if (!_parsed.success) {
  console.error('❌ Storefront invalid environment variables:');
  console.error(_parsed.error.flatten().fieldErrors);
  
  // During build phase, we might not have all env vars (e.g. in CI without secrets)
  // But for this project, let's just warn instead of crash during build, or we crash.
  // Next.js will crash if we process.exit(1) on a client browser, but this runs in Node/Edge.
  throw new Error('Invalid environment variables for storefront');
}

export const env = _parsed.data;
