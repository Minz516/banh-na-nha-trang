import { AppError } from '../../middlewares/errorMiddleware.js';
import { AuthRepository } from './auth.repository.js';
import type { LoginBody, CreateUserBody, UpdateUserBody } from '@repo/shared-types';
import type { IUser } from './auth.model.js';

export const AuthService = {
  async login(body: LoginBody): Promise<IUser> {
    const user = await AuthRepository.findByEmail(body.email);
    if (!user) throw new AppError(401, 'Email hoặc mật khẩu không đúng');
    if (!user.isActive) throw new AppError(403, 'Tài khoản đã bị vô hiệu hóa');

    const valid = await AuthRepository.verifyPassword(body.password, user.passwordHash);
    if (!valid) throw new AppError(401, 'Email hoặc mật khẩu không đúng');

    await AuthRepository.updateLastLogin(user._id.toString());
    return user;
  },

  async getUserById(id: string): Promise<IUser> {
    const user = await AuthRepository.findById(id);
    if (!user) throw new AppError(404, 'Người dùng không tồn tại');
    return user;
  },

  // ── User management (admin only — see roleMiddleware on the routes) ────────────

  async createUser(body: CreateUserBody): Promise<IUser> {
    const exists = await AuthRepository.existsByEmail(body.email);
    if (exists) throw new AppError(409, 'Email đã tồn tại');
    return AuthRepository.create({
      email: body.email,
      password: body.password,
      phone: body.phone,
      role: body.role,
    });
  },

  async listUsers(): Promise<IUser[]> {
    return AuthRepository.list();
  },

  async updateUser(id: string, body: UpdateUserBody, actorId: string): Promise<IUser> {
    if (id === actorId && body.role === 'staff') {
      throw new AppError(400, 'Không thể tự hạ quyền admin của chính mình');
    }
    if (id === actorId && body.isActive === false) {
      throw new AppError(400, 'Không thể tự vô hiệu hóa tài khoản của chính mình');
    }
    const user = await AuthRepository.updateById(id, body);
    if (!user) throw new AppError(404, 'Người dùng không tồn tại');
    return user;
  },
};
