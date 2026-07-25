import { locationService } from "@/services/location.service";
import { PlaceResult } from "@/models";
import { Alert } from "react-native";

export const locationController = {
  requestPermissionsAction: async (): Promise<boolean> => {
    const granted = await locationService.requestPermissions();
    if (!granted) {
      Alert.alert(
        "Permisos requeridos",
        "Mendoza Reporta necesita acceso a tu ubicación para centrar el mapa y registrar incidentes. Por favor, habilita los permisos de ubicación en los ajustes del sistema."
      );
    }
    return granted;
  },

  getCurrentLocationAction: async (): Promise<{ latitude: number; longitude: number } | null> => {
    const hasPermission = await locationService.requestPermissions();
    if (!hasPermission) {
      Alert.alert(
        "Permisos requeridos",
        "No se pudo acceder a la ubicación porque los permisos están denegados. Actívalos desde los ajustes del sistema."
      );
      return null;
    }
    const location = await locationService.getCurrentLocation();
    if (!location) {
      Alert.alert(
        "Error de GPS",
        "No pudimos obtener tu ubicación exacta. Por favor, verifica que tu GPS esté encendido e intenta de nuevo."
      );
    }
    return location;
  },

  getLastKnownLocationAction: async (): Promise<{ latitude: number; longitude: number } | null> => {
    const hasPermission = await locationService.requestPermissions();
    if (!hasPermission) return null;
    return await locationService.getLastKnownLocation();
  },

  reverseGeocodeAction: async (latitude: number, longitude: number): Promise<string> => {
    return await locationService.reverseGeocode(latitude, longitude);
  },

  searchAddressAction: async (query: string): Promise<PlaceResult[]> => {
    try {
      return await locationService.searchAddress(query);
    } catch (error) {
      console.error("Error searching address in controller:", error);
      return [];
    }
  },
};
