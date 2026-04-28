import { getAccessToken } from "@/utils/secureStorage";
import { api } from "./axiosInstance";
import {
  LoginRequest,
  AuthResponse,
  RegisterRequest,
} from "@/types/auth.types";

export const loginLocal = async (
  credentials: LoginRequest,
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/login", credentials);
  return response.data;
};

export const registerLocal = async (
  userData: RegisterRequest,
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>("/auth/register", userData);
  return response.data;
};

export const requestPasswordReset = async(email:string) => {
  const response = await api.post("/auth/forgot-password",{email});
  return response.data;
}

export const confirmPasswordReset = async (email:string,code:string, newPassword:string) => {
  const response = await api.post('/auth/reset-password',{email,code,newPassword});
  return response.data;
}

export const logoutBackend = async (refreshToken: string): Promise<void> => {
  await api.post("/auth/logout", { refreshToken });
};
