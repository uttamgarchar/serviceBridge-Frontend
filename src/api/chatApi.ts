import api from "./axios";

export const chatApi = {
  getOrCreate: (bookingId: string) => api.get(`/chat/${bookingId}`),
  sendMessage: (bookingId: string, data: { message: string }) => api.post(`/chat/${bookingId}/message`, data),
};
