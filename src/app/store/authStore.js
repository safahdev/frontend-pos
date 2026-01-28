import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      
      setAuth: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token });
      },
      
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null });
      },
      
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)