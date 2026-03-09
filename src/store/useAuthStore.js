import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      schoolId: null,
      
      login: (userData, token) => set({ 
        user: userData, 
        token,
        schoolId: userData.school_id || null
      }),
      
      logout: () => set({ user: null, token: null, schoolId: null }),
      
      setSchool: (schoolId) => set({ schoolId }),
      
      isAuthenticated: () => {
        const state = useAuthStore.getState();
        return !!state.token;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
