import api from "./axios";

export const verificationApi = {
  getPending: () => api.get("/verification/pending-providers"),
  getProviderDetails: (id: string) => api.get(`/verification/provider/${id}`),
  approve: (id: string) => api.put(`/verification/approve/${id}`),
  reject: (id: string) => api.put(`/verification/reject/${id}`),
  analytics: () => api.get("/verification/analytics"),
};
