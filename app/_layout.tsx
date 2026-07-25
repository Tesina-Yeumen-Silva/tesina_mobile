import { useColorScheme } from "@/hooks/useColorScheme";
import Colors from "@/constants/Colors";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider as StyledThemeProvider } from "styled-components/native";
import { Slot } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { GestureHandlerRootView } from "react-native-gesture-handler"; // 🚀 Agrega esto
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { authController } from "@/controllers/auth.controller";

const queryClient = new QueryClient();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  const checkSession = useAuthStore((state) => state.checkSession);

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded) return null;

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  useOfflineSync();
  const colorScheme = useColorScheme();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const currentTheme = colorScheme === "dark" ? Colors.dark : Colors.light;

  useEffect(() => {
    if (isLoggedIn) {
      authController.registerDevicePushToken();
    }
  }, [isLoggedIn]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StyledThemeProvider theme={currentTheme}>
            <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
            <ThemeProvider
              value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
              <Slot />
            </ThemeProvider>
          </StyledThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
