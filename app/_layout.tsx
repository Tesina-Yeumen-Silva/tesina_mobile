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
import { Slot, ErrorBoundaryProps, useRouter } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { authController } from "@/controllers/auth.controller";
import { Alert, ScrollView } from "react-native";
import styled from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";

const queryClient = new QueryClient();

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const router = useRouter();

  return (
    <FallbackContainer>
      <Ionicons name="alert-circle" size={80} color="#F44336" />
      <FallbackTitle>Algo salió mal</FallbackTitle>
      <FallbackDescription>
        Ocurrió un error inesperado al renderizar esta pantalla. Puedes intentar
        rebotar o volver al inicio.
      </FallbackDescription>

      <ErrorLogBox>
        <ScrollView style={{ maxHeight: 120 }}>
          <ErrorLogText>
            {error?.stack || error?.message || String(error)}
          </ErrorLogText>
        </ScrollView>
      </ErrorLogBox>

      <FallbackButton onPress={retry}>
        <FallbackButtonText>Reintentar</FallbackButtonText>
      </FallbackButton>

      <GoHomeButton onPress={() => router.replace("/")}>
        <GoHomeButtonText>Ir al Mapa</GoHomeButtonText>
      </GoHomeButton>
    </FallbackContainer>
  );
}

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
    if (!__DEV__) {
      const originalHandler = ErrorUtils.getGlobalHandler();
      ErrorUtils.setGlobalHandler((error, isFatal) => {
        console.error("Fatal JS Error caught globally:", error);

        Alert.alert(
          "Error de ejecución",
          "La aplicación experimentó un error inesperado. Si el problema persiste, reinicia la aplicación.",
          [
            {
              text: "Aceptar",
              onPress: () => {
                if (isFatal && originalHandler) {
                  originalHandler(error, isFatal);
                }
              },
            },
          ],
        );
      });
    }
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

const FallbackContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
  padding: 24px;
`;

const FallbackTitle = styled.Text`
  font-size: 22px;
  font-weight: bold;
  color: #2c3e50;
  margin-top: 16px;
`;

const FallbackDescription = styled.Text`
  font-size: 14px;
  color: #7f8c8d;
  text-align: center;
  margin-top: 8px;
  margin-bottom: 20px;
  line-height: 20px;
`;

const ErrorLogBox = styled.View`
  width: 100%;
  background-color: #ecf0f1;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 24px;
  border-width: 1px;
  border-color: #bdc3c7;
`;

const ErrorLogText = styled.Text`
  font-family: monospace;
  font-size: 11px;
  color: #c0392b;
`;

const FallbackButton = styled.TouchableOpacity`
  background-color: #2196f3;
  padding-horizontal: 32px;
  padding-vertical: 12px;
  border-radius: 25px;
  margin-bottom: 12px;
  elevation: 2;
  shadow-color: #2196f3;
  shadow-opacity: 0.2;
  shadow-radius: 3px;
  shadow-offset: 0px 2px;
`;

const FallbackButtonText = styled.Text`
  color: #ffffff;
  font-size: 15px;
  font-weight: bold;
`;

const GoHomeButton = styled.TouchableOpacity`
  padding-vertical: 8px;
`;

const GoHomeButtonText = styled.Text`
  color: #2196f3;
  font-size: 14px;
  font-weight: 600;
`;
