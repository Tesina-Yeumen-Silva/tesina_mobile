import * as Location from "expo-location";
import { PlaceResult } from "../models";

export const locationService = {
  requestPermissions: async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === "granted";
    } catch (error) {
      console.error("Error requesting location permissions:", error);
      return false;
    }
  },

  getCurrentLocation: async (): Promise<{ latitude: number; longitude: number } | null> => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error("Error getting current position:", error);
      return null;
    }
  },

  getLastKnownLocation: async (): Promise<{ latitude: number; longitude: number } | null> => {
    try {
      const location = await Location.getLastKnownPositionAsync();
      if (!location) return null;
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error("Error getting last known position:", error);
      return null;
    }
  },

  reverseGeocode: async (latitude: number, longitude: number): Promise<string> => {
    try {
      const reverse = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (reverse.length > 0) {
        const addr = reverse[0];
        const street = addr.street || addr.name || "Ubicación seleccionada";
        const subregion = addr.subregion ? `, ${addr.subregion}` : "";
        return `${street}${subregion}`;
      }
      return "Ubicación seleccionada en el mapa";
    } catch (error) {
      console.error("Error in reverseGeocode:", error);
      return "Ubicación seleccionada en el mapa";
    }
  },

  searchAddress: async (query: string): Promise<PlaceResult[]> => {
    const finalQuery = query.toLowerCase().includes("mendoza")
      ? query
      : `${query}, Mendoza`;

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        finalQuery,
      )}&countrycodes=ar&limit=5`,
    );
    return await response.json();
  },
};
