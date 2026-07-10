import { connectDB } from './config/db.config.js';
import { env } from './config/env.js';
import { createApp } from './app.js';

async function main(): Promise<void> {
  await connectDB();
  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`🚀 API server running on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
  });
}

main().catch((err) => {
  console.error('❌ Fatal startup error:', err);
  process.exit(1);
});
