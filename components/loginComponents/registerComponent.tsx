import React, { useState } from "react";
import { View, TextInput, Text } from "@/components/Themed";
import styled, { useTheme } from "styled-components/native";
import { BackButton } from "../iu/BackButton";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/authStore";

const RegisterComponent = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isPasswordSecure, setIsPasswordSecure] = useState<boolean>(true);
  const theme = useTheme();
  const router = useRouter();

  const { register, isLoading } = useAuthStore();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    try {
      await register({ email, name, password });
      Alert.alert("Correcto", "Usted fue registrado con éxito");
      router.replace("/");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Hubo un problema al crear la cuenta";
      Alert.alert("Error en el registro", errorMessage);
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
            <RegisterCard>
              <RegisterText>Registrarse en Mendoza Reporta</RegisterText>
              <Separator />
              <InputEmail
                placeholder="Email"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              <InputName
                placeholder="Nombre y apellido"
                value={name}
                onChangeText={setName}
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

              <PasswordWrapper>
                <InputPassword
                  placeholder="Confirmar contraseña"
                  autoCapitalize="none"
                  secureTextEntry={isPasswordSecure}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
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

              <RegisterButton
                onPress={handleRegister}
                disabled={isLoading}
                style={{ opacity: isLoading ? 0.7 : 1 }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <RegisterButtonText>Registrarse</RegisterButtonText>
                )}
              </RegisterButton>
            </RegisterCard>
          </Container>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterComponent;

const Container = styled(View)`
  flex: 1;
  background-color: ${(props: any) => props.theme.background};
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const RegisterCard = styled(View)`
  background-color: ${(props: any) => props.theme.surface};
  width: 80%;
  max-width: 400px;
  padding: 30px;
  border-radius: 20px;
  align-items: center;
`;

const RegisterText = styled(Text)`
  font-size: 20px;
  font-weight: bold;
  text-align: center;
`;

const Separator = styled(View)`
  height: 1px;
  width: 100%;
  background-color: ${(props: any) => props.theme.text};
  margin-bottom: 15px;
  margin-top: 15px;
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
const InputName = styled(StyledInput)``;
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

const RegisterButton = styled.TouchableOpacity`
  width: 100%;
  height: 55px;
  background-color: ${(props) => props.theme.tint};
  border-radius: 12px;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
`;

const RegisterButtonText = styled(Text)`
  font-size: 18px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
`;
