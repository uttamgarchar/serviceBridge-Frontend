import api from "./axios";

export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post("/auth/register", data),
  verifyOtp: (data: { email: string; otp: string }) =>
    api.post("/auth/verify-otp", data),
  resendOtp: (data: { email: string }) =>
    api.post("/auth/resend-otp", data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  forgotPassword: (data: { email: string }) =>
    api.post("/auth/forgetpassword", data),
  resetPassword: (data: { email: string; otp: string; newPassword: string }) =>
    api.post("/auth/resetpassword", data),
};
