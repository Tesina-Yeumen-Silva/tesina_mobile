import styled, { useTheme } from "styled-components/native";
import { Text, TextInput, View } from "@/components/Themed";
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
import { useEffect, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { confirmPasswordReset, requestPasswordReset } from "@/api/auth.api";

const RestorePasswordComponent = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isPasswordSecure, setIsPasswordSecure] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(60);

  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (step === 2 && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown, step]);

  const handleRestorePassword = async () => {
    setIsLoading(true);
    try {
      if (step === 1) {
        if (!email) {
          Alert.alert("Error", "Ingresa tu correo electrónico");
          setIsLoading(false);
          return;
        }

        await requestPasswordReset(email);
        Alert.alert("Éxito", "Te hemos enviado un código a tu correo");
        setStep(2);
      } else {
        if (!code || !password) {
          Alert.alert("Error", "Ingresa el código y tu nueva contraseña");
          setIsLoading(false);
          return;
        }

        await confirmPasswordReset(email, code, password);
        Alert.alert(
          "¡Listo!",
          "Tu contraseña ha sido actualizada exitosamente.",
        );
        router.replace("/login");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Ocurrió un error inesperado";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      await requestPasswordReset(email);
      setCountdown(60);
      Alert.alert("Éxito", "Te hemos enviado un nuevo código");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Ocurrió un error al reenviar";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
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
              <RestoreText>Recuperar Contraseña</RestoreText>
              <Separator />

              {step === 1 && (
                <InputEmail
                  placeholder="Email"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              )}

              {step === 2 && (
                <>
                  <InputEmail
                    placeholder="Código de 6 dígitos"
                    keyboardType="numeric"
                    value={code}
                    onChangeText={setCode}
                  />

                  <PasswordWrapper>
                    <InputPassword
                      placeholder="Nueva Contraseña"
                      autoCapitalize="none"
                      secureTextEntry={isPasswordSecure}
                      value={password}
                      onChangeText={setPassword}
                      style={{ paddingRight: 50 }}
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
                </>
              )}

              <RestoreButton
                onPress={handleRestorePassword}
                disabled={isLoading}
                style={{ opacity: isLoading ? 0.7 : 1 }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <RestoreButtonText>
                    {step === 1 ? "Enviar Código" : "Actualizar Contraseña"}
                  </RestoreButtonText>
                )}
              </RestoreButton>

              {step === 2 && (
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
              )}
            </RegisterCard>
          </Container>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RestorePasswordComponent;

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

const RestoreText = styled(Text)`
  font-size: 18px;
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

const RestoreButton = styled.TouchableOpacity`
  width: 100%;
  height: 50px;
  background-color: ${(props) => props.theme.tint};
  border-radius: 12px;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
`;

const RestoreButtonText = styled(Text)`
  font-size: 16px;
  font-weight: bold;
  text-align: center;
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
