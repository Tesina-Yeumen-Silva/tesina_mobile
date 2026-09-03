import { Text, TextInput, View } from "@/components/ui/Themed";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import styled, { useTheme } from "styled-components/native";
import { BackButton } from "@/components/ui/BackButton";
import { MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";
import { authController } from "@/controllers/auth.controller";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

const LoginView = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isPasswordSecure, setIsPasswordSecure] = useState<boolean>(true);
  const router = useRouter();
  const theme = useTheme();

  const isLoading = useAuthStore((state) => state.isLoading);
  const { startGoogleAuth, isGoogleLoading } = useGoogleAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor Ingresa tu email y contraseña");
      return;
    }

    try {
      const result = await authController.loginAction({ email, password });
      if (result.ok) {
        setEmail("");
        setPassword("");
        router.replace("/");
      } else {
        Alert.alert(
          "Error de autenticación",
          result.error || "Email o contraseña incorrectos",
        );
      }
    } catch (error) {
      Alert.alert("Error de autenticación", "Email o contraseña incorrectos");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <BackButton />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <Container>
            <LoginCard>
              <LogoText>Mendoza Reporta</LogoText>

              <InputEmail
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="Ingrese su email"
                editable={!isLoading}
              />

              <PasswordWrapper>
                <InputPassword
                  placeholder="Contraseña"
                  autoCapitalize="none"
                  secureTextEntry={isPasswordSecure}
                  value={password}
                  onChangeText={setPassword}
                  style={{
                    paddingRight: 50,
                  }}
                />

                <TouchEye
                  onPress={() => setIsPasswordSecure(!isPasswordSecure)}
                >
                  <MaterialCommunityIcons
                    name={isPasswordSecure ? "eye-off" : "eye"}
                    size={24}
                    color={theme.text}
                  />
                </TouchEye>
              </PasswordWrapper>

              <LoginButton
                onPress={handleLogin}
                disabled={isLoading}
                style={{ opacity: isLoading ? 0.7 : 1 }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <LoginButtonText>Login</LoginButtonText>
                )}
              </LoginButton>

              <DividerContainer>
                <Line />
                <DividerText>O ingresar con</DividerText>
                <Line />
              </DividerContainer>

              <GoogleButton
                onPress={startGoogleAuth}
                disabled={isGoogleLoading}
              >
                {isGoogleLoading ? (
                  <ActivityIndicator color={theme.text} />
                ) : (
                  <>
                    <AntDesign
                      name="google"
                      size={20}
                      color={theme.text}
                      style={{ marginRight: 10 }}
                    />
                    <GoogleButtonText>Google</GoogleButtonText>
                  </>
                )}
              </GoogleButton>

              <LinkWrapper onPress={() => router.push("/register")}>
                <TextNormal>¿No tienes cuenta?</TextNormal>
                <TextBold>Regístrate aquí</TextBold>
              </LinkWrapper>

              <LinkWrapper onPress={() => router.push("/restorePassword")}>
                <TextBold>¿Olvidaste tu contraseña?</TextBold>
              </LinkWrapper>
            </LoginCard>
          </Container>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginView;

const Container = styled(View)`
  flex: 1;
  background-color: ${(props: any) => props.theme.background};
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const LoginCard = styled(View)`
  background-color: ${(props: any) => props.theme.surface};
  width: 80%;
  max-width: 400px;
  padding: 30px;
  border-radius: 20px;
  align-items: center;
`;

const StyledInput = styled(TextInput)`
  width: 100%;
  height: 55px;
  background-color: ${(props) => props.theme.background};
  border-radius: 12px;
  margin-bottom: 15px;
  font-size: 16px;
  border-width: 2px;
  padding-left: 2%;
  border-color: ${(props) => props.theme.border};
  color: ${(props) => props.theme.text};
`;

const InputEmail = styled(StyledInput)``;
const InputPassword = styled(StyledInput)``;

export const PasswordWrapper = styled.View`
  width: 100%;
  position: relative;
`;

export const TouchEye = styled.TouchableOpacity`
  position: absolute;
  right: 15px;
  top: 15px;
  z-index: 2;
`;

const LoginButton = styled.TouchableOpacity`
  width: 100%;
  height: 55px;
  background-color: ${(props) => props.theme.tint};
  border-radius: 12px;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
`;

const LogoText = styled.Text`
  font-size: 22px;
  font-weight: bold;
  color: ${(props) => props.theme.text};
`;

const LoginButtonText = styled(Text)`
  font-size: 18px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export const LinkWrapper = styled.TouchableOpacity`
  margin-top: 25px;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

export const TextNormal = styled.Text`
  color: ${({ theme }) => theme.text || "#666"};
  font-size: 14px;
`;

export const TextBold = styled.Text`
  color: ${({ theme }) => theme.tint || "#007BFF"};
  font-size: 14px;
  font-weight: bold;
  margin-left: 5px;
`;

const DividerContainer = styled.View`
  flex-direction: row;
  align-items: center;
  width: 100%;
  margin-top: 20px;
  margin-bottom: 5px;
`;

const Line = styled.View`
  flex: 1;
  height: 1px;
  background-color: ${(props) => props.theme.border};
`;

const DividerText = styled(Text)`
  margin-horizontal: 10px;
  font-size: 14px;
  opacity: 0.6;
`;

const GoogleButton = styled.TouchableOpacity`
  width: 100%;
  height: 55px;
  background-color: ${(props) => props.theme.background};
  border-radius: 12px;
  border-width: 1px;
  border-color: ${(props) => props.theme.border};
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
`;

const GoogleButtonText = styled(Text)`
  font-size: 16px;
  font-weight: bold;
`;
