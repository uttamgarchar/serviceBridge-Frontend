
import { create } from "zustand";
import { authApi } from "@/api/authApi";
import { userApi } from "@/api/userApi";

/* =====================================
   USER ROLE TYPES
===================================== */

export type UserRole =
  | "User"
  | "ServiceProvider"
  | "VerificationManager"
  | "Admin"
  | "ProviderManager";

export type ProviderStatus =
  | "pending"
  | "approved"
  | "rejected"
  | null;

/* =====================================
   USER INTERFACE
===================================== */

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;

  phone?: string;
  address?: string;

  isAccountVerified?: boolean;

  providerStatus?: ProviderStatus; // ✅ FIXED HERE

  provider?: Record<string, unknown>;
}

/* =====================================
   AUTH STATE
===================================== */

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  setUser: (user: User) => void;
}

/* =====================================
   ZUSTAND STORE
===================================== */

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem("sb_user") || "null"),
  token: localStorage.getItem("sb_token"),
  loading: false,
  isAuthenticated: !!localStorage.getItem("sb_token"),

  /* =====================================
     LOGIN
  ===================================== */

  login: async (email, password) => {
    set({ loading: true });

    try {
      const res = await authApi.login({ email, password });

      const { token, user } = res.data;

      localStorage.setItem("sb_token", token);
      localStorage.setItem("sb_user", JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        loading: false,
      });
    } catch {
      set({ loading: false });
      throw new Error("Login failed");
    }
  },

  /* =====================================
     REGISTER
  ===================================== */

  register: async (name, email, password) => {
    set({ loading: true });

    try {
      await authApi.register({ name, email, password });
      set({ loading: false });
    } catch {
      set({ loading: false });
      throw new Error("Registration failed");
    }
  },

  /* =====================================
     LOGOUT
  ===================================== */

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      /* ignore */
    }

    localStorage.removeItem("sb_token");
    localStorage.removeItem("sb_user");

    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  /* =====================================
     LOAD USER
  ===================================== */

  loadUser: async () => {
    try {
      const res = await userApi.getProfile();

      const user = res.data.user || res.data;

      localStorage.setItem("sb_user", JSON.stringify(user));

      set({
        user,
        isAuthenticated: true,
      });
    } catch {
      localStorage.removeItem("sb_token");
      localStorage.removeItem("sb_user");

      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    }
  },

  /* =====================================
     SET USER
  ===================================== */

  setUser: (user) => {
    localStorage.setItem("sb_user", JSON.stringify(user));
    set({ user });
  },
}));
