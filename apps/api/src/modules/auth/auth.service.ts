import { AppError } from '../../middlewares/errorMiddleware.js';
import { eventBus, AppEvents } from '../../utils/eventBus.js';
import { AuthRepository } from './auth.repository.js';
import type { RegisterBody, LoginBody } from '@repo/shared-types';
import type { IUser } from './auth.model.js';

export const AuthService = {
  async register(body: RegisterBody): Promise<IUser> {
    const exists = await AuthRepository.existsByEmail(body.email);
    if (exists) throw new AppError(409, 'Email đã được sử dụng');

    const user = await AuthRepository.create({
      email: body.email,
      password: body.password,
      phone: body.phone,
    });

    // Notify customer module to create a Customer record linked by phone
    eventBus.emit(AppEvents.USER_REGISTERED, {
      userId: (user._id as mongoose.Types.ObjectId).toString(),
      email: user.email,
      phone: body.phone,
      fullName: body.fullName,
    });

    return user;
  },

  async login(body: LoginBody): Promise<IUser> {
    const user = await AuthRepository.findByEmail(body.email);
    if (!user) throw new AppError(401, 'Email hoặc mật khẩu không đúng');
    if (!user.isActive) throw new AppError(403, 'Tài khoản đã bị vô hiệu hóa');

    const valid = await AuthRepository.verifyPassword(body.password, user.passwordHash);
    if (!valid) throw new AppError(401, 'Email hoặc mật khẩu không đúng');

    await AuthRepository.updateLastLogin((user._id as mongoose.Types.ObjectId).toString());
    return user;
  },

  async getUserById(id: string): Promise<IUser> {
    const user = await AuthRepository.findById(id);
    if (!user) throw new AppError(404, 'Người dùng không tồn tại');
    return user;
  },
};

import mongoose from 'mongoose';
