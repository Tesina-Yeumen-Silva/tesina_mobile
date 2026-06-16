import { api } from "./api";
import { Region } from "react-native-maps";
import {
  CreateReport,
  PaginatedReportsResponse,
  ReportDetails,
  ReportHistoryResponse,
  ReportMaker,
} from "../models";

export const reportsService = {
  fetchMapMakers: async (region: Region): Promise<ReportMaker[]> => {
    const minLat = region.latitude - region.latitudeDelta / 2;
    const maxLat = region.latitude + region.latitudeDelta / 2;
    const minLng = region.longitude - region.longitudeDelta / 2;
    const maxLng = region.longitude + region.longitudeDelta / 2;

    const response = await api.get("/reports/markers", {
      params: { minLat, maxLat, minLng, maxLng },
    });

    return response.data.data;
  },

  fetchReportById: async (reportId: number): Promise<ReportDetails> => {
    const response = await api.get(`/reports/${reportId}`);
    return response.data.data;
  },

  createReport: async (report: CreateReport) => {
    const formData = new FormData();

    formData.append("address", report.address);
    formData.append("latitude", String(report.latitude));
    formData.append("longitude", String(report.longitude));
    formData.append("description", report.description);
    formData.append("isAnonymous", String(report.isAnonymous));
    formData.append("categoryId", String(report.categoryId));

    const filename = report.image.split("/").pop() || "photo.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    formData.append("image", {
      uri: report.image,
      name: filename,
      type: type,
    } as any);

    const response = await api.post("/reports", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  toggleAdhesion: async (reportId: number): Promise<{ adhered: boolean }> => {
    const response = await api.post(`/reports/${reportId}/adhesions/toggle`);
    return response.data.data;
  },

  getReportsByUserId: async (page: number = 1): Promise<PaginatedReportsResponse> => {
    const response = await api.get(`/reports/user-reports?page=${page}&limit=10`);
    return response.data;
  },

  getHistoryByReportId: async (reportId: number): Promise<ReportHistoryResponse> => {
    const response = await api.get(`/reports/${reportId}/history`);
    return response.data.data;
  },
};
