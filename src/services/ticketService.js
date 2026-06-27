import axiosInstance from './axiosInstance'

export const ticketService = {
  getAll: (params) => axiosInstance.get('/api/tickets/', { params }),
  getById: (id) => axiosInstance.get(`/api/tickets/${id}/`),
  create: (data) => axiosInstance.post('/api/tickets/', data),
  update: (id, data) => axiosInstance.patch(`/api/tickets/${id}/`, data),
  remove: (id) => axiosInstance.delete(`/api/tickets/${id}/`),
}