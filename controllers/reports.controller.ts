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

  createReportAction: async (report: CreateReport): Promise<ActionResult> => {
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
      await reportsService.createReport(report);
      return { ok: true };
    } catch (error: any) {
      return {
        ok: false,
        error: error.response?.data?.message || "Ocurrió un error al subir el reporte.",
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
