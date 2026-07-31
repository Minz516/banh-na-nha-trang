import type { IUser } from './auth.model.js';

export const AuthDTO = {
  userResponse(user: IUser) {
    return {
      id: user._id.toString(),
      email: user.email,
      isActive: user.isActive,
      role: user.role,
    };
  },

  userListItem(user: IUser) {
    return {
      id: user._id.toString(),
      email: user.email,
      phone: user.phone ?? null,
      role: user.role,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt ?? null,
      createdAt: user.createdAt,
    };
  },
};
