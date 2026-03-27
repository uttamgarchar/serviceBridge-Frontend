import api from "./axios";

export const adminApi = {
  // Users
  getAllUsers: () => api.get("/admin/users"),
  searchUser: (email: string) => api.get("/admin/users/search", { params: { email } }),
  assignRole: (data: { userId: string; role: string }) => api.put("/admin/users/assign-role", data),
  blockUser: (userId: string) => api.put(`/admin/users/block/${userId}`),
  unblockUser: (userId: string) => api.put(`/admin/users/unblock/${userId}`),
  deleteUser: (userId: string) => api.delete(`/admin/users/${userId}`),

  // Providers
  getAllProviders: () => api.get("/admin/providers"),
  suspendProvider: (providerId: string) => api.put(`/admin/providers/suspend/${providerId}`),
  removeProvider: (providerId: string) => api.delete(`/admin/providers/${providerId}`),

  // Stats & Analytics
  getStats: () => api.get("/admin/analytics/dashboard/stats"),
  getDashboardAnalytics: () => api.get("/admin/analytics/dashboard/stats"),

  // Bookings
  getAllBookings: () => api.get("/admin/bookings"),
  cancelBooking: (bookingId: string) => api.put(`/admin/bookings/cancel/${bookingId}`),
  refundBooking: (bookingId: string) => api.post(`/admin/bookings/refund/${bookingId}`),

  // Categories
  getCategories: () => api.get("/admin/categories"),
  addCategory: (data: { name: string; description?: string }) => api.post("/admin/categories", data),
  updateCategory: (id: string, data: { name: string; description?: string }) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/admin/categories/${id}`),

  // Transactions
  getTransactions: () => api.get("/admin/transactions"),

  // Managers
  getManagers: () => api.get("/admin/managers"),
  createManager: (data: { name: string; email: string; password: string; role: string }) => api.post("/admin/managers", data),
  deleteManager: (id: string) => api.delete(`/admin/managers/${id}`),

  // Withdrawals
  getWithdrawals: () => api.get("/admin/withdrawals"),
  updateWithdrawal: (id: string, data: { status: string }) => api.put(`/admin/withdraw/${id}`, data),

  // Settings
  getSettings: () => api.get("/admin/settings"),
  updateSettings: (data: Record<string, unknown>) => api.put("/admin/settings", data),

  // Services
  getAllServices: () => api.get("/admin/services"),
  deleteService: (id: string) => api.delete(`/admin/services/${id}`),
};
