import { Text, TextInput, View } from "@/components/Themed";
import styled from "styled-components/native";

const LoginComponent = () => {
  return (
    <Container>
      <LoginCard>
        <Logo
          source={{
            uri: "https://i.pinimg.com/736x/90/58/3d/90583d6a4aaafaa6567539ec834f3696.jpg",
          }}
        />
        <InputEmail placeholder="Ingrese su email" />
        <InputPassword
          placeholder="Ingrese su contraseña"
          secureTextEntry={true}
        />
        <LoginButton>
          <LoginButtonText>Login</LoginButtonText>
        </LoginButton>
      </LoginCard>
    </Container>
  );
};
export default LoginComponent;

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

const Logo = styled.Image`
  width: 45%;
  aspect-ratio: 1;
  margin-bottom: 10%;
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

const LoginButton = styled.TouchableOpacity`
  width: 100%;
  height: 55px;
  background-color: ${(props) => props.theme.tint};
  border-radius: 12px;
  justify-content: center;
  align-items: center;
  margin-top: 10px;
`;

const LoginButtonText = styled(Text)`
  font-size: 18px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const forgotPasswordText = styled(Text)``;
