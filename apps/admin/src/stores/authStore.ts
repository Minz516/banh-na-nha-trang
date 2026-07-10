import { create } from 'zustand';
import { apiClient } from '../services/apiClient';

// Mirrors apps/api's AuthDTO.userResponse — staff/admin only, no customer accounts.
export type AuthUser = {
  id: string;
  email: string;
  isActive: boolean;
};

type SessionStatus = 'checking' | 'authenticated' | 'unauthenticated';

type AuthState = {
  status: SessionStatus;
  user: AuthUser | null;
  checkSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Local-only reset, no server round trip — used by the 401 interceptor. */
  clearSession: () => void;
};

// The access token is an httpOnly cookie — this store never reads it directly.
// `checkSession` is the only source of truth for whether the browser actually holds
// a valid session; it must run before any admin route is trusted as "authenticated".
export const useAuthStore = create<AuthState>()((set) => ({
  status: 'checking',
  user: null,

  checkSession: async () => {
    try {
      const user = (await apiClient.get('/auth/me')) as unknown as AuthUser;
      set({ status: 'authenticated', user });
    } catch {
      set({ status: 'unauthenticated', user: null });
    }
  },

  login: async (email, password) => {
    const user = (await apiClient.post('/auth/login', { email, password })) as unknown as AuthUser;
    set({ status: 'authenticated', user });
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      set({ status: 'unauthenticated', user: null });
    }
  },

  clearSession: () => set({ status: 'unauthenticated', user: null }),
}));
