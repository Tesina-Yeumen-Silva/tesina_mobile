import { locationService } from "@/services/location.service";
import { PlaceResult } from "@/models";

export const locationController = {
  requestPermissionsAction: async (): Promise<boolean> => {
    return await locationService.requestPermissions();
  },

  getCurrentLocationAction: async (): Promise<{ latitude: number; longitude: number } | null> => {
    const hasPermission = await locationService.requestPermissions();
    if (!hasPermission) return null;
    return await locationService.getCurrentLocation();
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
