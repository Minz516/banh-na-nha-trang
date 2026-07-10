import type { IUser } from './auth.model.js';

export const AuthDTO = {
  userResponse(user: IUser) {
    return {
      id: (user._id as import('mongoose').Types.ObjectId).toString(),
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    };
  },
};
