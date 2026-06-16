import React, { useState, useEffect } from "react";
import { View, TextInput, Text } from "@/components/ui/Themed";
import styled, { useTheme } from "styled-components/native";
import { BackButton } from "@/components/ui/BackButton";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { MaterialCommunityIcons, AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { authController } from "@/controllers/auth.controller";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

const RegisterView = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isPasswordSecure, setIsPasswordSecure] = useState<boolean>(true);
  const [code, setCode] = useState<string>("");
  const [signupToken, setSignupToken] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(60);

  const theme = useTheme();
  const router = useRouter();
  const isLoading = useAuthStore((state) => state.isLoading);
  const { startGoogleAuth, isGoogleLoading } = useGoogleAuth();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (step === 2 && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown, step]);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }

    const result = await authController.registerAction({
      email,
      name,
      password,
    });
    if (result.ok && result.data) {
      setSignupToken(result.data);
      setCountdown(60);
      setStep(2);
      Alert.alert("Éxito", "Te hemos enviado un código a tu correo.");
    } else {
      Alert.alert(
        "Error en el registro",
        result.error || "Hubo un problema al crear la cuenta",
      );
    }
  };

  const handleVerifyCode = async () => {
    if (!code) {
      Alert.alert("Error", "Por favor ingresa el código de verificación");
      return;
    }

    const result = await authController.confirmRegisterAction(
      email,
      code,
      signupToken,
    );
    if (result.ok) {
      Alert.alert("Correcto", "Usted fue registrado con éxito");
      router.replace("/");
    } else {
      Alert.alert(
        "Error en la verificación",
        result.error || "Hubo un problema al verificar el código",
      );
    }
  };

  const handleResendCode = async () => {
    const result = await authController.registerAction({
      email,
      name,
      password,
    });
    if (result.ok && result.data) {
      setSignupToken(result.data);
      setCountdown(60);
      Alert.alert("Éxito", "Te hemos enviado un nuevo código.");
    } else {
      Alert.alert("Error", result.error || "Ocurrió un error al reenviar");
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

              {step === 1 && (
                <>
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

                  <DividerContainer>
                    <Line />
                    <DividerText>O registrarse con</DividerText>
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
                </>
              )}

              {step === 2 && (
                <>
                  <Text
                    style={{
                      marginBottom: 15,
                      textAlign: "center",
                      color: theme.text,
                      opacity: 0.8,
                    }}
                  >
                    Ingresa el código de 6 dígitos enviado a tu correo
                    electrónico: {email}
                  </Text>

                  <InputEmail
                    placeholder="Código de 6 dígitos"
                    keyboardType="numeric"
                    value={code}
                    onChangeText={setCode}
                  />

                  <RegisterButton
                    onPress={handleVerifyCode}
                    disabled={isLoading}
                    style={{ opacity: isLoading ? 0.7 : 1 }}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <RegisterButtonText>Verificar Código</RegisterButtonText>
                    )}
                  </RegisterButton>

                  <ResendContainer>
                    {countdown > 0 ? (
                      <ResendText>
                        Podrás reenviar el código en {countdown}s
                      </ResendText>
                    ) : (
                      <ResendButton
                        onPress={handleResendCode}
                        disabled={isLoading}
                      >
                        <ResendTextActive>
                          ¿No te llegó? Reenviar código
                        </ResendTextActive>
                      </ResendButton>
                    )}
                  </ResendContainer>

                  <BackButtonContainer>
                    <BackToFormButton onPress={() => setStep(1)}>
                      <BackToFormText>Volver y corregir datos</BackToFormText>
                    </BackToFormButton>
                  </BackButtonContainer>
                </>
              )}
            </RegisterCard>
          </Container>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterView;

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

export const ResendContainer = styled.View`
  margin-top: 15px;
  align-items: center;
`;

export const ResendText = styled(Text)`
  font-size: 14px;
  color: ${(props: any) => props.theme.text};
  text-align: center;
  opacity: 0.6;
`;

export const ResendButton = styled.TouchableOpacity`
  padding: 5px;
`;

export const ResendTextActive = styled(Text)`
  font-size: 14px;
  color: ${(props: any) => props.theme.tint};
  font-weight: bold;
  text-align: center;
`;

const BackButtonContainer = styled.View`
  margin-top: 20px;
  width: 100%;
  align-items: center;
`;

const BackToFormButton = styled.TouchableOpacity`
  padding: 10px;
`;

const BackToFormText = styled(Text)`
  font-size: 14px;
  color: ${(props) => props.theme.text};
  opacity: 0.7;
  text-decoration-line: underline;
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
