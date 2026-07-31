import bcrypt from 'bcrypt';
import { UserModel, type IUser, type UserRole } from './auth.model.js';

export const AuthRepository = {
  async findByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email: email.toLowerCase() });
  },

  async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(id);
  },

  async create(data: { email: string; password: string; phone?: string; role?: UserRole }): Promise<IUser> {
    const user = new UserModel({
      email: data.email,
      passwordHash: data.password, // hashed in pre-save hook
      phone: data.phone,
      role: data.role ?? 'staff',
    });
    return user.save();
  },

  async list(): Promise<IUser[]> {
    return UserModel.find().sort({ createdAt: -1 });
  },

  async updateById(id: string, data: Partial<Pick<IUser, 'role' | 'isActive'>>): Promise<IUser | null> {
    return UserModel.findByIdAndUpdate(id, data, { new: true });
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
