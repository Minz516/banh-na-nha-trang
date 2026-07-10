import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type AuthState = {
  isAuthenticated: boolean;
  user: { email: string; name?: string } | null;
  setAuth: (user: { email: string; name?: string }) => void;
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
    { name: 'auth-storage' }
  )
);
