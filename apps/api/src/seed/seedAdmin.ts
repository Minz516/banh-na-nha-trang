/**
 * seedAdmin.ts — creates or syncs the one admin user against .env (idempotent).
 * Run with: pnpm seed:admin
 */
import { connectDB, disconnectDB } from '../config/db.config.js';
import { UserModel } from '../modules/auth/auth.model.js';
import { env } from '../config/env.js';

async function seedAdmin(): Promise<void> {
  await connectDB();

  const existing = await UserModel.findOne({ email: env.ADMIN_EMAIL });

  if (existing) {
    // Re-assigning passwordHash to the plaintext env value re-triggers the
    // pre-save bcrypt hook, so the account always matches .env exactly.
    existing.passwordHash = env.ADMIN_PASSWORD;
    existing.phone = env.ADMIN_PHONE;
    existing.isActive = true;
    await existing.save();
    console.log(`✅ Admin user synced with .env: ${env.ADMIN_EMAIL}`);
  } else {
    await UserModel.create({
      email: env.ADMIN_EMAIL,
      passwordHash: env.ADMIN_PASSWORD, // hashed by the model's pre-save hook
      phone: env.ADMIN_PHONE,
    });
    console.log(`✅ Admin user created: ${env.ADMIN_EMAIL}`);
  }

  await disconnectDB();
}

seedAdmin().catch((err) => {
  console.error('❌ seedAdmin error:', err);
  process.exit(1);
});
