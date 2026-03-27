import api from "./axios";

export const discoveryApi = {
  getAllServices: (params?: Record<string, string>) => api.get("/discovery/services", { params }),
  getProviderProfile: (providerId: string) => api.get(`/discovery/provider/${providerId}`),
};
