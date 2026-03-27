import api from "./axios";

export const walletApi = {
  getBalance: () => api.get("/wallet/balance"),
  getTransactions: () => api.get("/wallet/transactions"),
};
