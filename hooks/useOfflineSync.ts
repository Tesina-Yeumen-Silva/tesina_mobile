import { useEffect } from "react";
import { AppState, Alert } from "react-native";
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

      for (const report of pending) {
        try {
          const parsedData = JSON.parse(report.data_json);
          let finalAddress = parsedData.address;

          if (
            finalAddress === "Ubicación seleccionada en el mapa" ||
            finalAddress === "Ubicación guardada (Sin conexión)" ||
            !finalAddress
          ) {
            try {
              let reverse = await Location.reverseGeocodeAsync({
                latitude: parsedData.latitude,
                longitude: parsedData.longitude,
              });

              if (reverse.length > 0) {
                const addr = reverse[0];
                const streetName = addr.street || addr.name || "";
                const streetNumber = addr.streetNumber
                  ? ` ${addr.streetNumber}`
                  : "";

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
                finalAddress = `${street}${subregion}`;
              }
            } catch (geocodeError) {
              console.warn(
                "No se pudo traducir la dirección en background, se enviará con el texto por defecto:",
                geocodeError,
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
                console.warn("La foto ya no estaba en el dispositivo:", e);
              }
            }

            Alert.alert(
              "Reporte Sincronizado",
              `Tu reporte pendiente en "${finalAddress}" se ha enviado correctamente ahora que tienes conexión.`,
            );
          } else {
            console.error(`❌ Falló el envío del reporte offline:`, result.error);
            Alert.alert(
              "Sincronización fallida",
              `No se pudo enviar tu reporte pendiente en "${finalAddress}": ${result.error || "Error desconocido"}`
            );
          }
        } catch (itemError: any) {
          console.error(`❌ Falló el envío del reporte offline:`, itemError);
          Alert.alert(
            "Sincronización fallida",
            `Ocurrió un error inesperado al procesar tu reporte pendiente: ${itemError?.message || "Error desconocido"}`
          );
        }
      }
    } catch (error) {
      console.error("Error general en el hook de sincronización:", error);
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
