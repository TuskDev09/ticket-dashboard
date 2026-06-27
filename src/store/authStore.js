import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,

  setAuth: (token) => {
    const payload = JSON.parse(atob(token.split('.')[1]))
    set({
      accessToken: token,
      user: {
        id: payload.user_id,
        role: payload.role,
        email: payload.email,
      },
      isAuthenticated: true,
    })
  },

  clearAuth: () => set({
    accessToken: null,
    user: null,
    isAuthenticated: false,
  }),
}))