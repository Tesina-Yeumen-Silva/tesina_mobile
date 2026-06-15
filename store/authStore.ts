import { create } from "zustand";
import { User, LoginRequest, RegisterRequest } from "@/types/auth.types";
import {
  loginLocal,
  logoutBackend,
  registerLocal,
  confirmRegister,
} from "@/api/auth.api";
import {
  saveToken,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveRefreshToken,
} from "@/utils/secureStorage";

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  register: (userData: RegisterRequest) => Promise<string>;
  confirmRegister: (
    email: string,
    code: string,
    signupToken: string,
  ) => Promise<void>;
  loginWithTokens: (
    token: string,
    refreshToken: string,
    user: User,
  ) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  isLoading: false,

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const data = await loginLocal(credentials);

      await saveToken(data.token);
      await saveRefreshToken(data.refreshToken);

      set({
        user: data.user,
        isLoggedIn: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  logout: async () => {
    try {
      const refreshToken = await getRefreshToken();

      if (refreshToken) {
        await logoutBackend(refreshToken);
      }
    } catch (error) {
      console.log("Error en el servidor al desloguear:", error);
    } finally {
      await clearTokens();
      set({ user: null, isLoggedIn: false });
    }
  },
  checkSession: async () => {
    set({ isLoading: true });
    try {
      const token = await getAccessToken();

      if (token) {
        set({ isLoggedIn: true, isLoading: false });
      } else {
        set({ isLoggedIn: false, isLoading: false });
      }
    } catch (error) {
      set({ isLoggedIn: false, isLoading: false });
    }
  },
  register: async (userData: RegisterRequest) => {
    set({ isLoading: true });
    try {
      const data = await registerLocal(userData);
      set({ isLoading: false });
      return data.signupToken;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  confirmRegister: async (email: string, code: string, signupToken: string) => {
    set({ isLoading: true });
    try {
      const data = await confirmRegister({ email, code, signupToken });

      await saveToken(data.token);
      await saveRefreshToken(data.refreshToken);

      set({
        user: data.user,
        isLoggedIn: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  loginWithTokens: async (token, refreshToken, user) => {
    set({ isLoading: true });
    try {
      await saveToken(token);
      await saveRefreshToken(refreshToken);
      set({
        user,
        isLoggedIn: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));
