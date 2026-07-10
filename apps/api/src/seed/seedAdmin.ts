/**
 * seedAdmin.ts — creates one admin user (idempotent).
 * Run with: pnpm seed:admin
 */
import { connectDB, disconnectDB } from '../config/db.config.js';
import { UserModel } from '../modules/auth/auth.model.js';

const ADMIN_EMAIL = 'admin@banhtrangnhana.com';
// NOTE: UserModel.pre('save') hashes passwordHash automatically
const ADMIN_PASSWORD_PLAIN = 'Admin@2024!'; // change in production

async function seedAdmin(): Promise<void> {
  await connectDB();

  const existing = await UserModel.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log('✅ Admin user already exists — skipping');
    await disconnectDB();
    return;
  }

  // The model pre-save hook will bcrypt-hash passwordHash
  await UserModel.create({
    email: ADMIN_EMAIL,
    passwordHash: ADMIN_PASSWORD_PLAIN,
    isActive: true,
  });

  console.log(`✅ Admin user created: ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD_PLAIN}`);
  console.log(`   ⚠️  Change this password after first login!`);

  await disconnectDB();
}

seedAdmin().catch((err) => {
  console.error('❌ seedAdmin error:', err);
  process.exit(1);
});
