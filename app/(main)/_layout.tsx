import { Drawer } from "expo-router/drawer";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "styled-components/native";
import { useAuthStore } from "@/store/authStore";

import { CustomDrawerContent } from "@/components/navigation/CustomDrawerContent";

export default function MainLayout() {
  const theme = useTheme();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

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
        drawerInactiveTintColor: theme.text,
        drawerLabelStyle: { fontSize: 16, fontWeight: "500" },
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: "Mapa",
          drawerLabel: "Mapa",
          drawerIcon: ({ color }) => <Ionicons name="map" size={22} color={color} />,
        }}
      />

      <Drawer.Screen
        name="profile"
        options={{
          title: "Mi Cuenta",
          drawerLabel: "Perfil",
          drawerIcon: ({ color }) => <MaterialIcons name="person" size={22} color={color} />,
          
          drawerItemStyle: { display: isLoggedIn ? 'flex' : 'none' } 
        }}
      />
    </Drawer>
  );
}