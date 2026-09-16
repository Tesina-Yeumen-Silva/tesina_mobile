import { Drawer } from "expo-router/drawer";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "styled-components/native";
import { useAuthStore } from "@/store/authStore";
import { TouchableOpacity, StyleSheet } from "react-native";
import { DrawerActions } from "@react-navigation/native";

import { CustomDrawerContent } from "@/components/navigation/CustomDrawerContent";

export default function MainLayout() {
  const theme = useTheme();
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        headerTitleAlign: "center",
        headerStyle: {
          backgroundColor: theme.background,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.text,
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
            style={styles.menuButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityLabel="Abrir menú"
            accessibilityRole="button"
          >
            <Ionicons name="menu" size={28} color={theme.text} />
          </TouchableOpacity>
        ),

        drawerStyle: {
          width: 250,
          backgroundColor: theme.background,
        },
        drawerActiveTintColor: theme.tint,
        drawerInactiveTintColor: theme.text,
        drawerLabelStyle: { fontSize: 16, fontWeight: "500" },
      })}
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
        name="report"
        options={{
          title: "Reportar",
          drawerLabel: "Reportar",
          drawerIcon: ({ color }) => (
            <MaterialIcons name="report" size={22} color={color} />
          ),

          drawerItemStyle: { display: isLoggedIn ? "flex" : "none" },
        }}
      />

      <Drawer.Screen
        name="profile"
        options={{
          title: "Mi Cuenta",
          drawerLabel: "Mis reportes",
          drawerIcon: ({ color }) => (
            <MaterialIcons name="person" size={22} color={color} />
          ),

          drawerItemStyle: { display: isLoggedIn ? "flex" : "none" },
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    marginLeft: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
