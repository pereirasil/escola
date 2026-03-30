import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      schoolId: null,
      responsible: null,
      students: [],
      studentId: null,

      setTokens: (accessToken, refreshToken) =>
        set({
          token: accessToken,
          refreshToken: refreshToken ?? get().refreshToken,
        }),

      login: (userData, token, extra = {}) =>
        set({
          user: userData,
          token,
          refreshToken: extra.refreshToken ?? null,
          schoolId: userData.school_id ?? extra.schoolId ?? null,
          responsible: extra.responsible ?? null,
          students: extra.students ?? [],
          studentId: extra.studentId ?? null,
        }),

      logout: () => {
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const rt = get().refreshToken;
        if (rt) {
          void fetch(`${baseURL}/auth/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: rt }),
          }).catch(() => {});
        }
        set({
          user: null,
          token: null,
          refreshToken: null,
          schoolId: null,
          responsible: null,
          students: [],
          studentId: null,
        });
      },

      setSchool: (schoolId) => set({ schoolId }),

      setStudent: (studentId, token, schoolId, refreshToken) => {
        const prev = get().user;
        set({
          studentId,
          token: token ?? get().token,
          schoolId: schoolId ?? get().schoolId,
          refreshToken: refreshToken ?? get().refreshToken,
          user:
            prev && prev.role === 'responsible'
              ? { ...prev, student_id: studentId, school_id: schoolId ?? prev.school_id }
              : prev,
        });
      },

      isAuthenticated: () => {
        const state = get();
        return !!state.token;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
