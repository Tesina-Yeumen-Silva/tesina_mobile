import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { Drawer } from "expo-router/drawer";
import React from "react";
import styled, { useTheme } from "styled-components/native";

const CustomDrawerContent = (props: any) => {
  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ paddingTop: 0 }}
    >
      <HeaderContainer>
        <LogoText>Mendoza Reporta</LogoText>
        <SubtitleText>Gestión Urbana</SubtitleText>
      </HeaderContainer>

      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
};

const NavigationBar = () => {
  const theme = useTheme();

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: theme.background,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.text,
        drawerStyle: {
          width: 250,
          backgroundColor: theme.background,
        },
        drawerActiveTintColor: theme.tint,
        drawerInactiveTintColor: theme.border,
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: "500",
        },
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: "Mapa",
          drawerLabel: "Mapa",
          drawerIcon: ({ color }) => (
            <Ionicons name="map" size={22} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="login/index"
        options={{
          title: "Mi Cuenta",
          drawerLabel: "Perfil",
          drawerIcon: ({ color }) => (
            <MaterialIcons name="person" size={22} color={color} />
          ),
        }}
      />
    </Drawer>
  );
};

export default NavigationBar;

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
