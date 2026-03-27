import api from "./axios";

export const couponApi = {
  create: (data: Record<string, unknown>) => api.post("/coupons", data),
  getAll: () => api.get("/coupons"),
  validate: (data: { code: string }) => api.post("/coupons/validate", data),
};
