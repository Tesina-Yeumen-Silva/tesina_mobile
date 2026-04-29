import { api } from "./axiosInstance";
import { Region } from "react-native-maps";
import { ReportDetails, ReportMaker } from "@/types/reports.types";

export const fetchMapMakers = async (
  region: Region,
): Promise<ReportMaker[]> => {
  const minLat = region.latitude - region.latitudeDelta / 2;
  const maxLat = region.latitude + region.latitudeDelta / 2;
  const minLng = region.longitude - region.longitudeDelta / 2;
  const maxLng = region.longitude + region.longitudeDelta / 2;

  const response = await api.get("/reports/markers", {
    params: { minLat, maxLat, minLng, maxLng },
  });

  return response.data.data;
};

export const fetchReportById = async (
  reportId: number,
): Promise<ReportDetails> => {
  const response = await api.get(`/reports/${reportId}`);

  return response.data.data;
};

export const toggleAdhesion = async(reportId:number) :Promise<{ adhered: boolean }> => {
    const response = await api.post(`/reports/${reportId}/adhesions/toggle`)

    return response.data.data;
}
