import { connectDB } from './config/db.config.js';
import { env } from './config/env.js';
import { initSentry } from './config/sentry.config.js';
import { logger } from './config/logger.config.js';
import { createApp } from './app.js';

async function main(): Promise<void> {
  initSentry();
  await connectDB();
  const app = createApp();
  app.listen(env.PORT, () => {
    logger.info(`🚀 API server running on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
  });
}

main().catch((err) => {
  logger.error({ err }, '❌ Fatal startup error');
  process.exit(1);
});
