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
  setLogin: (accessToken, user) => {
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    }
    set({ accessToken, user, isAuthenticated: true });
  },
  setLogout: () => {
    localStorage.removeItem('accessToken');
    set({ accessToken: null, user: null, isAuthenticated: false });
  },
}));
