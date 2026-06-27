import axiosInstance from './axiosInstance'

export const authService = {
  login: async (email, password) => {
    const { data } = await axiosInstance.post('/api/auth/login/', { email, password })
    return data
  },

  refresh: async (refresh) => {
    const { data } = await axiosInstance.post('/api/auth/refresh/', { refresh })
    return data
  },
}