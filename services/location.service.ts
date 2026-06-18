import * as Location from "expo-location";
import { PlaceResult } from "../models";
import * as Network from "expo-network";

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

  getCurrentLocation: async (): Promise<{
    latitude: number;
    longitude: number;
  } | null> => {
    try {
      const lastKnown = await Location.getLastKnownPositionAsync();
      if (lastKnown) {
        return {
          latitude: lastKnown.coords.latitude,
          longitude: lastKnown.coords.longitude,
        };
      }

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

  getLastKnownLocation: async (): Promise<{
    latitude: number;
    longitude: number;
  } | null> => {
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

  reverseGeocode: async (
    latitude: number,
    longitude: number,
  ): Promise<string> => {
    try {
      try {
        const network = await Network.getNetworkStateAsync();
        if (!network.isConnected || !network.isInternetReachable) {
          return "Ubicación guardada (Sin conexión)";
        }
      } catch (netError) {
        console.warn("Error checking network in reverseGeocode:", netError);
      }

      try {
        const reverse = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        if (reverse && reverse.length > 0) {
          const addr = reverse[0];
          console.log("Reverse geocode address object (native):", addr);
          const streetName = addr.street || addr.name || "";
          const streetNumber = addr.streetNumber ? ` ${addr.streetNumber}` : "";

          let street = streetName;
          if (
            streetName &&
            addr.streetNumber &&
            !streetName.includes(addr.streetNumber)
          ) {
            street = `${streetName}${streetNumber}`;
          } else if (!streetName) {
            street = "Ubicación seleccionada";
          }

          const subregion = addr.subregion ? `, ${addr.subregion}` : "";
          return `${street}${subregion}`;
        }
      } catch (nativeError) {
        console.warn(
          "Native reverseGeocode failed or timed out. Falling back to Nominatim API:",
          nativeError,
        );
      }

      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
        const response = await fetch(url, {
          headers: {
            "User-Agent": "MendozaReportaMobileApp",
          },
        });
        const data = await response.json();
        if (data && data.address) {
          const road =
            data.address.road ||
            data.address.pedestrian ||
            data.address.suburb ||
            "";
          const houseNumber = data.address.house_number
            ? ` ${data.address.house_number}`
            : "";
          const street = road
            ? `${road}${houseNumber}`
            : "Ubicación seleccionada";
          const city =
            data.address.city ||
            data.address.town ||
            data.address.village ||
            data.address.subregion ||
            "";
          const subregion = city ? `, ${city}` : "";
          return `${street}${subregion}`;
        }
      } catch (fetchError) {
        console.warn(
          "Nominatim reverseGeocode failed (likely offline):",
          fetchError,
        );
      }

      return "Ubicación guardada (Sin conexión)";
    } catch (error) {
      console.error("Error in reverseGeocode:", error);
      return "Ubicación guardada (Sin conexión)";
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
