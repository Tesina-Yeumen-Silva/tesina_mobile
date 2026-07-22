import { reportsService } from "@/services/reports.service";
import { Region } from "react-native-maps";
import {
  CreateReport,
  PaginatedReportsResponse,
  ReportDetails,
  ReportHistoryResponse,
  ReportMaker,
} from "@/models";
import { ActionResult } from "./auth.controller";
import * as Network from "expo-network";
import { File } from "expo-file-system";
import { documentDirectory } from "expo-file-system/legacy";
import { saveOfflineReport } from "@/services/offlineStorage";

export const reportsController = {
  fetchMapMakersAction: async (region: Region): Promise<ReportMaker[]> => {
    try {
      return await reportsService.fetchMapMakers(region);
    } catch (error) {
      console.log("Error en controller al obtener marcadores:", error);
      return [];
    }
  },

  fetchReportByIdAction: async (reportId: number): Promise<ReportDetails | null> => {
    try {
      return await reportsService.fetchReportById(reportId);
    } catch (error) {
      console.log("Error en controller al obtener detalle de reporte:", error);
      return null;
    }
  },

  createReportAction: async (report: CreateReport): Promise<ActionResult<{ offline: boolean }>> => {
    if (!report.address) {
      return { ok: false, error: "La ubicación del incidente es obligatoria." };
    }
    if (!report.description || report.description.trim().length < 10) {
      return { ok: false, error: "La descripción debe tener al menos 10 caracteres." };
    }
    if (!report.image) {
      return { ok: false, error: "Debes adjuntar una imagen de evidencia." };
    }

    try {
      const networkState = await Network.getNetworkStateAsync();
      if (networkState.isConnected && networkState.isInternetReachable) {
        await reportsService.createReport(report);
        return { ok: true, data: { offline: false } };
      } else {
        const filename = report.image.split("/").pop() || "photo.jpg";
        const permanentImageUri = `${documentDirectory}offline_${Date.now()}_${filename}`;

        const originalFile = new File(report.image);
        const destinationFile = new File(permanentImageUri);

        await originalFile.copy(destinationFile);

        const reportData = {
          address: report.address,
          latitude: report.latitude,
          longitude: report.longitude,
          description: report.description,
          isAnonymous: report.isAnonymous,
          categoryId: report.categoryId,
        };

        saveOfflineReport(reportData, permanentImageUri);
        return { ok: true, data: { offline: true } };
      }
    } catch (error: any) {
      console.log("Error creando reporte (Online/Offline):", error);
      return {
        ok: false,
        error: error.response?.data?.message || "Ocurrió un error al procesar el reporte.",
      };
    }
  },

  toggleAdhesionAction: async (reportId: number): Promise<ActionResult<{ adhered: boolean }>> => {
    try {
      const data = await reportsService.toggleAdhesion(reportId);
      return { ok: true, data };
    } catch (error: any) {
      return {
        ok: false,
        error: error.response?.data?.message || "No se pudo registrar tu adhesión.",
      };
    }
  },

  getReportsByUserIdAction: async (
    page: number = 1,
  ): Promise<PaginatedReportsResponse | null> => {
    try {
      return await reportsService.getReportsByUserId(page);
    } catch (error) {
      console.log("Error en controller al obtener reportes del usuario:", error);
      return null;
    }
  },

  getHistoryByReportIdAction: async (
    reportId: number,
  ): Promise<ReportHistoryResponse | null> => {
    try {
      return await reportsService.getHistoryByReportId(reportId);
    } catch (error) {
      console.log("Error en controller al obtener historial del reporte:", error);
      return null;
    }
  },

};
