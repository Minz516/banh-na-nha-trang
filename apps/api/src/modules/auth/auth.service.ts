import { AppError } from '../../middlewares/errorMiddleware.js';
import { AuthRepository } from './auth.repository.js';
import type { LoginBody } from '@repo/shared-types';
import type { IUser } from './auth.model.js';

export const AuthService = {
  async login(body: LoginBody): Promise<IUser> {
    const user = await AuthRepository.findByEmail(body.email);
    if (!user) throw new AppError(401, 'Email hoặc mật khẩu không đúng');
    if (!user.isActive) throw new AppError(403, 'Tài khoản đã bị vô hiệu hóa');

    const valid = await AuthRepository.verifyPassword(body.password, user.passwordHash);
    if (!valid) throw new AppError(401, 'Email hoặc mật khẩu không đúng');

    await AuthRepository.updateLastLogin((user._id as import('mongoose').Types.ObjectId).toString());
    return user;
  },

  async getUserById(id: string): Promise<IUser> {
    const user = await AuthRepository.findById(id);
    if (!user) throw new AppError(404, 'Người dùng không tồn tại');
    return user;
  },
};
