import { create } from 'zustand';
import { AUTH_TOKEN_KEY } from '../lib/constants';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem(AUTH_TOKEN_KEY),

  setAuth: (user, token) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    set({ user: null, token: null });
  },

  isAdmin: () => get().user?.role === 'admin',
}));
