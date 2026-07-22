import { useEffect } from "react";
import { AppState } from "react-native";
import * as Network from "expo-network";
import { File } from "expo-file-system";
import {
  getPendingReports,
  deletePendingReport,
} from "@/services/offlineStorage";
import { reportsController } from "@/controllers/reports.controller";
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
            finalAddress === "Ubicación guardada (Sin conexión)" ||
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
                const streetName = addr.street || addr.name || "";
                const streetNumber = addr.streetNumber ? ` ${addr.streetNumber}` : "";
                
                let street = streetName;
                if (streetName && addr.streetNumber && !streetName.includes(addr.streetNumber)) {
                  street = `${streetName}${streetNumber}`;
                } else if (!streetName) {
                  street = "Ubicación seleccionada";
                }

                const subregion = addr.subregion ? `, ${addr.subregion}` : "";
                finalAddress = `${street}${subregion}`;
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

          const result = await reportsController.createReportAction(payload);

          if (result.ok) {
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
          } else {
            console.log(`❌ Falló el envío del reporte offline:`, result.error);
          }
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
