import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.config.js';
import { Sentry } from './sentry.config.js';

export async function connectDB(): Promise<void> {
  const uri = env.MONGODB_URI;

  mongoose.connection.on('connected', () => {
    logger.info('✅ MongoDB connected');
  });

  mongoose.connection.on('error', (err) => {
    logger.error({ err }, '❌ MongoDB connection error');
    Sentry.captureException(err);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('⚠️  MongoDB disconnected');
  });

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
