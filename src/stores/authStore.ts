import { create } from 'zustand';

type AuthStore = {
  accessToken: string | null;
  userId: number | null;
  role: 'HOST' | 'MEMBER' | null;
  nickname: string | null;
  profileImage: string | null;
  guestToken: string | null;
  setAuth: (params: {
    accessToken: string;
    userId: number;
    role: 'HOST' | 'MEMBER';
    nickname: string;
    profileImage?: string;
  }) => void;
  setGuestToken: (token: string) => void;
  setRole: (role: 'HOST' | 'MEMBER') => void;
  clear: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: localStorage.getItem('accessToken'),
  userId: null,
  role: null,
  nickname: null,
  profileImage: null,
  guestToken: null,

  setAuth: ({ accessToken, userId, role, nickname, profileImage }) => {
    localStorage.setItem('accessToken', accessToken);
    set({ accessToken, userId, role, nickname, profileImage: profileImage ?? null });
  },

  setGuestToken: (token) => {
    sessionStorage.setItem('guestToken', token);
    set({ guestToken: token });
  },

  setRole: (role) => set({ role }),

  clear: () => {
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('guestToken');
    set({
      accessToken: null,
      userId: null,
      role: null,
      nickname: null,
      profileImage: null,
      guestToken: null,
    });
  },
}));
