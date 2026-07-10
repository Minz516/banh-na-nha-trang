import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB(): Promise<void> {
  const uri = env.MONGODB_URI;

  mongoose.connection.on('connected', () => {
    console.log('✅ MongoDB connected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected');
  });

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
