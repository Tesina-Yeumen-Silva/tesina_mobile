import * as secureStorage from "expo-secure-store";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export const saveToken = async (accessToken: string) => {
  await secureStorage.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
};

export const saveRefreshToken = async (refreshToken: string) => {
  await secureStorage.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
};

export const getAccessToken = async () => {
  return await secureStorage.getItemAsync(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = async () => {
  return await secureStorage.getItemAsync(REFRESH_TOKEN_KEY);
};

export const clearTokens = async () => {
  await secureStorage.deleteItemAsync(ACCESS_TOKEN_KEY);
  await secureStorage.deleteItemAsync(REFRESH_TOKEN_KEY);
};
