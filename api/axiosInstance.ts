import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  saveToken,
} from "@/utils/secureStorage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.endsWith("/auth/refresh") &&
      !originalRequest.url?.endsWith("/auth/logout")
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = await getRefreshToken(); 

        if (!refreshToken) {
          throw new Error("No hay refresh token");
        }

        const refreshResponse = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = refreshResponse.data;

        await saveToken(accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        const { useAuthStore } = require('../store/authStore');
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);