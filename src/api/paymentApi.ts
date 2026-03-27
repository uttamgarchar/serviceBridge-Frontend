import api from "./axios";

export const paymentApi = {
  createOrder: (data: Record<string, unknown>) => api.post("/payments/create-order", data),
  verify: (data: Record<string, unknown>) => api.post("/payments/verify", data),
  refund: (paymentId: string) => api.post(`/payments/refund/${paymentId}`),
};
