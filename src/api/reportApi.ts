import api from "./axios";

export const reportApi = {
  create: (data: Record<string, unknown>) => api.post("/reports/reports", data),
  getMy: () => api.get("/reports/my"),
  getAll: () => api.get("/reports"),
  updateStatus: (id: string, data: { status: string }) => api.put(`/reports/${id}`, data),
};
