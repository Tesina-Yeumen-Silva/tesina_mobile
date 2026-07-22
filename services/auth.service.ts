import { api } from "./api";
import {
  LoginRequest,
  AuthResponse,
  RegisterRequest,
  RegisterResponse,
  ConfirmRegisterRequest,
} from "../models";

export const authService = {
  loginLocal: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    return response.data;
  },

  registerLocal: async (userData: RegisterRequest): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>("/auth/register", userData);
    return response.data;
  },

  confirmRegister: async (data: ConfirmRegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/register/confirm", data);
    return response.data;
  },

  requestPasswordReset: async (email: string) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  confirmPasswordReset: async (email: string, code: string, newPassword: string) => {
    const response = await api.post('/auth/reset-password', { email, code, newPassword });
    return response.data;
  },

  logoutBackend: async (refreshToken: string): Promise<void> => {
    await api.post("/auth/logout", { refreshToken });
  },
};
