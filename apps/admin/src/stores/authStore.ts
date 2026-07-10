import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CustomerMap } from '@repo/shared-types';

type UserSession = CustomerMap['MeResponse']; // MeResponse represents the logged in user

type AuthState = {
  isAuthenticated: boolean;
  user: UserSession | null;
  setAuth: (user: UserSession) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      setAuth: (user) => set({ isAuthenticated: true, user }),
      logout: () => set({ isAuthenticated: false, user: null }),
    }),
    { name: 'admin-auth-storage' }
  )
);
