import api from "./axios";

export const providerDocApi = {

  upload: (data: any) =>
    api.post("/provider-documents/upload", data),

  getProviderDocuments: (providerId: string) =>
    api.get(`/provider-documents/${providerId}`),

  review: (
    providerId: string,
    data: { action: "approve" | "reject"; reason?: string }
  ) =>
    api.put(`/provider-documents/review/${providerId}`, data),
};