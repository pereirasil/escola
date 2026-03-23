import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      schoolId: null,
      responsible: null,
      students: [],
      studentId: null,

      login: (userData, token, extra = {}) => set({
        user: userData,
        token,
        schoolId: userData.school_id ?? extra.schoolId ?? null,
        responsible: extra.responsible ?? null,
        students: extra.students ?? [],
        studentId: extra.studentId ?? null,
      }),

      logout: () => set({
        user: null,
        token: null,
        schoolId: null,
        responsible: null,
        students: [],
        studentId: null,
      }),

      setSchool: (schoolId) => set({ schoolId }),

      setStudent: (studentId, token, schoolId) => set({
        studentId,
        token: token ?? useAuthStore.getState().token,
        schoolId: schoolId ?? useAuthStore.getState().schoolId,
      }),

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
