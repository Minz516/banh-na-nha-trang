import { AuthRepository } from './auth.repository.js';
import type { IUser } from './auth.model.js';

/**
 * Public interface exposed to other modules.
 * Other modules MUST import from here, never from auth.service.ts or auth.repository.ts directly.
 */
export const AuthInterfaces = {
  async getUserById(id: string): Promise<IUser | null> {
    return AuthRepository.findById(id);
  },

  async getUserByEmail(email: string): Promise<IUser | null> {
    return AuthRepository.findByEmail(email);
  },
};
