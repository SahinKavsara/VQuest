import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      
      login: (userData, authToken) => set({ user: userData, token: authToken }),
      logout: () => set({ user: null, token: null }),
      updateUser: (data) => set({ user: { ...get().user, ...data } }),
      
      get isAdmin() {
        return get().user?.role === 'admin';
      }
    }),
    {
      name: 'vquest-auth',
    }
  )
);
