import axiosInstance from './axiosInstance'

export const commentService = {
  getAll: (ticketId) => axiosInstance.get(`/api/tickets/${ticketId}/comments`),
  create: (ticketId, data) => axiosInstance.post(`/api/tickets/${ticketId}/comments`, data),
}