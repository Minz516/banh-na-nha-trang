import bcrypt from 'bcrypt';
import { UserModel, type IUser } from './auth.model.js';

export const AuthRepository = {
  async findByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email: email.toLowerCase() });
  },

  async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(id);
  },

  async create(data: { email: string; password: string; phone?: string }): Promise<IUser> {
    const user = new UserModel({
      email: data.email,
      passwordHash: data.password, // hashed in pre-save hook
      phone: data.phone,
    });
    return user.save();
  },

  async updateLastLogin(id: string): Promise<void> {
    await UserModel.findByIdAndUpdate(id, { lastLoginAt: new Date() });
  },

  async verifyPassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  },

  async existsByEmail(email: string): Promise<boolean> {
    return !!(await UserModel.exists({ email: email.toLowerCase() }));
  },
};
