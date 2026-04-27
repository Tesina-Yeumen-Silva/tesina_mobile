import { api } from "./axiosInstance";
import { LoginRequest, LoginResponse } from "@/types/auth.types";

export const loginLocal = async (
  credentials: LoginRequest,
): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/auth/login", credentials);
  return response.data;
};

export const logoutBackend = async (refreshToken: string): Promise<void> => {
  await api.post("/auth/logout", { refreshToken });
};
