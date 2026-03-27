import api from "./axios";

export interface CreateBookingPayload {
  service: string;
  provider: string;
  priceAtBooking: number;
  serviceOtp: string;
}

export interface CompleteBookingPayload {
  otp: string;
}

export const bookingApi = {
  create: (data: CreateBookingPayload) =>
    api.post("/bookings", data),

  getUserBookings: () =>
    api.get("/bookings/user"),

  getProviderBookings: () =>
    api.get("/bookings/provider"),

  accept: (bookingId: string) =>
    api.put(`/bookings/accept/${bookingId}`),

  complete: (bookingId: string, data: CompleteBookingPayload) =>
    api.put(`/bookings/complete/${bookingId}`, data),

  cancel: (bookingId: string) =>
    api.put(`/bookings/cancel/${bookingId}`),
};
