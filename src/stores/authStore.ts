import { create } from 'zustand';
import type { User } from '@/types/user';

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setLogin: (accessToken: string, user: User) => void;
  setLogout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  setLogin: (accessToken, user) =>
    set({
      accessToken,
      user,
      isAuthenticated: true,
    }),
  setLogout: () =>
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
    }),
}));