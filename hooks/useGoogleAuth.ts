import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "expo-router";
import { Alert } from "react-native";

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const loginWithTokens = useAuthStore((state) => state.loginWithTokens);
  const router = useRouter();

  const startGoogleAuth = async () => {
    setIsGoogleLoading(true);

    const redirectUrl = Linking.createURL("/login-success");

    const authUrl = `${process.env.EXPO_PUBLIC_API_URL}/auth/google/?redirect_uri=${encodeURIComponent(redirectUrl)}`;

    try {
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUrl,
      );

      if (result.type === "success" && result.url) {
        const { queryParams } = Linking.parse(result.url);
        const token = queryParams?.token as string;
        const refreshToken = queryParams?.refreshToken as string;
        const userJson = queryParams?.user as string;

        if (token && refreshToken && userJson) {
          const user = JSON.parse(userJson);

          await loginWithTokens(token, refreshToken, user);

          router.replace("/");
          return;
        }
      }
      setIsGoogleLoading(false);
    } catch (error) {
      Alert.alert("Error", "Ocurrió un error al conectar con Google");
      console.error(error);
    }
  };
  return { startGoogleAuth, isGoogleLoading };
};
