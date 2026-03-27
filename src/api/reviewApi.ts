import api from "./axios";

export const reviewApi = {
  add: (data: Record<string, unknown>) => api.post("/reviews/reviews", data),
  delete: (id: string) => api.delete(`/reviews/${id}`),
  getProviderReviews: (providerId: string) => api.get(`/reviews/provider/${providerId}`),
  flag: (id: string) => api.put(`/reviews/flag/${id}`),
};
