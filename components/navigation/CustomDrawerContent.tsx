import { useAuthStore } from "@/store/authStore";
import { MaterialIcons } from "@expo/vector-icons";
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import React from "react";
import { Alert, View } from "react-native";
import styled, { useTheme } from "styled-components/native";

export const CustomDrawerContent = (props: any) => {
  const router = useRouter();
  const { isLoggedIn, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert("Cerrar Sesion", "¿Estás seguro de que quieres salir", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Salir",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/");
        },
      },
    ]);
  };

  return (
    // 🚀 1. Este View envuelve TODO el menú y ocupa toda la pantalla
    <View style={{ flex: 1 }}>
      {/* 🚀 2. El ScrollView empuja todo hacia arriba */}
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ paddingTop: 0 }}
      >
        <HeaderContainer>
          <LogoText>Mendoza Reporta</LogoText>
          <SubtitleText>Gestión Urbana</SubtitleText>
        </HeaderContainer>

        <DrawerItemList {...props} />

        {!isLoggedIn && (
          <DrawerItem
            label="Iniciar Sesión"
            icon={({ color, size }) => (
              <MaterialIcons name="login" size={size} color={color} />
            )}
            onPress={() => router.push("/login")}
            activeTintColor={props.activeTintColor}
            inactiveTintColor={props.inactiveTintColor}
            labelStyle={props.labelStyle}
          />
        )}
      </DrawerContentScrollView>

      {isLoggedIn && (
        <View style={{ paddingBottom: 20 }}>
          <DrawerItem
            label="Cerrar Sesión"
            icon={({ size }) => (
              <MaterialIcons name="logout" size={size} color="#FF4444" />
            )}
            onPress={handleLogout}
            inactiveTintColor="#FF4444"
            labelStyle={props.labelStyle}
          />
        </View>
      )}
    </View>
  );
};

const HeaderContainer = styled.View`
  padding: 40px 20px 20px 20px;
  background-color: ${(props) => props.theme.background};
  border-bottom-width: 1px;
  border-bottom-color: ${(props) => props.theme.border};
  margin-bottom: 10px;
`;

const LogoText = styled.Text`
  font-size: 22px;
  font-weight: bold;
  color: ${(props) => props.theme.text};
`;

const SubtitleText = styled.Text`
  font-size: 13px;
  color: ${(props) => props.theme.text};
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 4px;
`;
