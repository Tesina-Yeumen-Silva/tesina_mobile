import { useEffect } from "react";
import { AppState } from "react-native";
import * as Network from "expo-network";
import { File } from "expo-file-system";
import {
  getPendingReports,
  deletePendingReport,
} from "../utils/offlineStorage";
import { createReport } from "../api/reports.api";
import * as Location from "expo-location";

export const useOfflineSync = () => {
  const syncReports = async () => {
    try {
      const networkState = await Network.getNetworkStateAsync();
      if (!networkState.isConnected || !networkState.isInternetReachable) {
        return;
      }

      const pending = getPendingReports();
      if (pending.length === 0) return;

      console.log(
        `🔄 Internet detectado. Sincronizando ${pending.length} reportes...`,
      );

      for (const report of pending) {
        try {
          const parsedData = JSON.parse(report.data_json);
          let finalAddress = parsedData.address;

          if (
            finalAddress === "Ubicación seleccionada en el mapa" ||
            !finalAddress
          ) {
            console.log("Traduciendo coordenadas a texto antes de enviar...");
            try {
              let reverse = await Location.reverseGeocodeAsync({
                latitude: parsedData.latitude,
                longitude: parsedData.longitude,
              });

              if (reverse.length > 0) {
                const addr = reverse[0];
                finalAddress =
                  `${addr.street || ""} ${addr.name || ""}, ${addr.subregion || ""}`.trim();
              }
            } catch (geocodeError) {
              console.log(
                "No se pudo traducir la dirección en background, se enviará con el texto por defecto.",
              );
            }
          }

          const payload = {
            ...parsedData,
            address: finalAddress, 
            image: report.image_uri,
          };

          await createReport(payload);

          deletePendingReport(report.id);

          if (report.image_uri) {
            try {
              const file = new File(report.image_uri);
              await file.delete();
            } catch (e) {
              console.log("La foto ya no estaba en el dispositivo.");
            }
          }

          console.log(`✅ Reporte offline enviado con éxito.`);
        } catch (itemError) {
          console.log(`❌ Falló el envío del reporte offline:`, itemError);
        }
      }
    } catch (error) {
      console.log("Error general en el hook de sincronización:", error);
    }
  };

  useEffect(() => {
    syncReports();

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        syncReports();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return { syncReports };
};
